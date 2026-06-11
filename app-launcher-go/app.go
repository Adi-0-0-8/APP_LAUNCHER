package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows/registry"
)

var (
	user32            = syscall.NewLazyDLL("user32.dll")
	procGetCursorPos  = user32.NewProc("GetCursorPos")
	procGetWindowLong = user32.NewProc("GetWindowLongW")
	procSetWindowLong = user32.NewProc("SetWindowLongW")
	procFindWindow    = user32.NewProc("FindWindowW")
	procShowWindow    = user32.NewProc("ShowWindow")
	procSetParent     = user32.NewProc("SetParent")
)

const (
	WS_EX_TOOLWINDOW = 0x00000080
	WS_EX_APPWINDOW  = 0x00040000
	SW_HIDE          = 0
	SW_SHOW          = 5
	HWND_MESSAGE     = ^uintptr(2) // -3, special parent for message-only windows
)

func hideFromTaskbar() bool {
	title, _ := syscall.UTF16PtrFromString("AppLauncher_Wails_Invisible_Overlay")
	hwnd, _, _ := procFindWindow.Call(0, uintptr(unsafe.Pointer(title)))
	if hwnd == 0 {
		return false
	}
	
	// Method 1: Set extended window style
	exStyle, _, _ := procGetWindowLong.Call(hwnd, ^uintptr(19))
	exStyle |= WS_EX_TOOLWINDOW
	exStyle &^= WS_EX_APPWINDOW
	procSetWindowLong.Call(hwnd, ^uintptr(19), exStyle)
	
	// Method 2: Set owner to desktop window (stronger approach)
	// This makes the window owned by desktop, which prevents taskbar icon
	procSetParent.Call(hwnd, HWND_MESSAGE)
	procSetParent.Call(hwnd, 0) // Reset to no parent but keep the effect
	
	// Force refresh
	procShowWindow.Call(hwnd, SW_HIDE)
	time.Sleep(10 * time.Millisecond)
	procShowWindow.Call(hwnd, SW_SHOW)
	
	fmt.Println("🚫 Hidden from taskbar")
	return true
}

type POINT struct {
	X int32
	Y int32
}

func getCursorPos() (int, int) {
	var pt POINT
	procGetCursorPos.Call(uintptr(unsafe.Pointer(&pt)))
	return int(pt.X), int(pt.Y)
}

func setClickThrough(clickThrough bool) {
	title, _ := syscall.UTF16PtrFromString("AppLauncher_Wails_Invisible_Overlay")
	hwnd, _, _ := procFindWindow.Call(0, uintptr(unsafe.Pointer(title)))
	if hwnd != 0 {
		exStyle, _, _ := procGetWindowLong.Call(hwnd, ^uintptr(19))
		if clickThrough {
			exStyle |= 0x00000020 // WS_EX_TRANSPARENT
			exStyle |= 0x00080000 // WS_EX_LAYERED
		} else {
			exStyle &^= 0x00000020 // Remove WS_EX_TRANSPARENT
		}
		procSetWindowLong.Call(hwnd, ^uintptr(19), exStyle)
	}
}

// App struct
type App struct {
	ctx       context.Context
	serverURL string
	winHeight int
}

// URLItem represents a single app URL
type URLItem struct {
	ID         string `json:"id"`
	URL        string `json:"url"`
	Title      string `json:"title"`
	Favicon    string `json:"favicon"`
	Published  bool   `json:"published"`
	CustomName string `json:"customName"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	serverURL := os.Getenv("SERVER_URL")
	if serverURL == "" {
		serverURL = "https://app-launcher-u0x7.onrender.com"
	}
	return &App{
		serverURL: serverURL,
	}
}

// Windows Startup Integration
func addToStartup() {
	exePath, err := os.Executable()
	if err != nil {
		fmt.Println("Error getting executable path:", err)
		return
	}

	k, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.ALL_ACCESS)
	if err != nil {
		fmt.Println("Error opening registry key:", err)
		return
	}
	defer k.Close()

	err = k.SetStringValue("AppLauncherGo", exePath)
	if err != nil {
		fmt.Println("Error setting registry value:", err)
	} else {
		fmt.Println("✅ Successfully added to Windows Startup")
	}
}

func cleanUpOldExecutable() {
	exePath, _ := os.Executable()
	oldFile := exePath + ".old"
	if _, err := os.Stat(oldFile); err == nil {
		os.Remove(oldFile)
		fmt.Println("🧹 Cleaned up old executable")
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	// Add to startup on launch
	addToStartup()
	cleanUpOldExecutable()

	// Hide from taskbar using Windows API - do it IMMEDIATELY and aggressively
	go func() {
		for i := 0; i < 10; i++ {
			time.Sleep(50 * time.Millisecond)
			if hideFromTaskbar() {
				// Keep trying a few more times to ensure it stays hidden
				time.Sleep(200 * time.Millisecond)
				hideFromTaskbar()
				break
			}
		}
	}()

	// Check for updates
	go a.CheckForUpdates()
	fmt.Println("===========================================")
	fmt.Println("🚀 Starting App Launcher (Go)")
	fmt.Println("📡 Server URL:", a.serverURL)
	// Try to set window height to full screen
	screens, err := runtime.ScreenGetAll(ctx)
	if err == nil && len(screens) > 0 {
		primary := screens[0]
		for _, s := range screens {
			if s.IsCurrent {
				primary = s
				break
			}
		}
		a.winHeight = primary.Size.Height
		runtime.WindowSetSize(ctx, 68, a.winHeight)
	} else {
		// Fallback
		a.winHeight = 1080
		runtime.WindowSetSize(ctx, 68, a.winHeight)
	}

	// Position window on left edge of screen
	runtime.WindowSetPosition(ctx, 0, 0)

	// Start global mouse tracking
	go a.monitorMouse()
}

// monitorMouse polls global cursor position and emits expand/collapse events
func (a *App) monitorMouse() {
	isExpanded := false

	// Let window initialize
	time.Sleep(500 * time.Millisecond)

	// Make window click-through initially since it starts collapsed
	setClickThrough(true)

	for {
		if a.ctx == nil {
			time.Sleep(100 * time.Millisecond)
			continue
		}

		x, y := getCursorPos()

		// Get exact physical window boundaries using Win32 API to completely bypass DPI scaling offsets
		var physicalCenterY int
		title, _ := syscall.UTF16PtrFromString("AppLauncher_Wails_Invisible_Overlay")
		hwnd, _, _ := procFindWindow.Call(0, uintptr(unsafe.Pointer(title)))
		if hwnd != 0 {
			var rect struct {
				Left, Top, Right, Bottom int32
			}
			user32.NewProc("GetWindowRect").Call(hwnd, uintptr(unsafe.Pointer(&rect)))
			physicalCenterY = int(rect.Top + (rect.Bottom-rect.Top)/2)
		} else {
			// Fallback if window not found
			_, winY := runtime.WindowGetPosition(a.ctx)
			_, winHeight := runtime.WindowGetSize(a.ctx)
			physicalCenterY = winY + (winHeight / 2)
		}

		// The purple pill is exactly 80px tall (40px up and down from center)
		triggerTop := physicalCenterY - 45
		triggerBottom := physicalCenterY + 45

		if !isExpanded && x <= 20 && y >= triggerTop && y <= triggerBottom {
			isExpanded = true
			setClickThrough(false)
			runtime.EventsEmit(a.ctx, "expanded")
		} else if isExpanded && x > 150 {
			isExpanded = false
			setClickThrough(true)
			runtime.EventsEmit(a.ctx, "collapsed")
		}

		time.Sleep(100 * time.Millisecond)
	}
}

// FetchURLs fetches the published URLs from the server
func (a *App) FetchURLs() ([]URLItem, error) {
	url := fmt.Sprintf("%s/urls", a.serverURL)
	
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URLs: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var urls []URLItem
	err = json.Unmarshal(body, &urls)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	return urls, nil
}

// OpenURL opens a URL in the default browser
func (a *App) OpenURL(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// QuitApp closes the application
func (a *App) QuitApp() {
	runtime.Quit(a.ctx)
}

const currentVersion = "v1.1.4"
const repoURL = "https://api.github.com/repos/Adi-0-0-8/APP_LAUNCHER/releases/latest"

type ReleaseInfo struct {
	TagName string `json:"tag_name"`
	Assets  []struct {
		Name               string `json:"name"`
		BrowserDownloadURL string `json:"browser_download_url"`
	} `json:"assets"`
}

var latestUpdate ReleaseInfo

func (a *App) CheckForUpdates() {
	resp, err := http.Get(repoURL)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		json.NewDecoder(resp.Body).Decode(&latestUpdate)
		if latestUpdate.TagName != "" && latestUpdate.TagName != currentVersion {
			fmt.Println("🌟 Update available:", latestUpdate.TagName)
			time.Sleep(3 * time.Second) // Ensure frontend is fully loaded before emitting
			runtime.EventsEmit(a.ctx, "update-available", latestUpdate.TagName)
		}
	}
}

func (a *App) InstallUpdate() error {
	downloadURL := ""
	for _, asset := range latestUpdate.Assets {
		if strings.HasSuffix(asset.Name, ".exe") {
			downloadURL = asset.BrowserDownloadURL
			break
		}
	}

	if downloadURL == "" {
		return fmt.Errorf("no executable found in release")
	}

	exePath, err := os.Executable()
	if err != nil {
		return err
	}

	resp, err := http.Get(downloadURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	tempFile := exePath + ".new"
	out, err := os.Create(tempFile)
	if err != nil {
		return err
	}

	_, err = io.Copy(out, resp.Body)
	out.Close()
	if err != nil {
		return err
	}

	oldFile := exePath + ".old"
	os.Remove(oldFile) // Clean up any existing
	err = os.Rename(exePath, oldFile)
	if err != nil {
		return err
	}

	err = os.Rename(tempFile, exePath)
	if err != nil {
		os.Rename(oldFile, exePath) // rollback
		return err
	}

	cmd := exec.Command(exePath)
	err = cmd.Start()
	if err != nil {
		return err
	}

	runtime.Quit(a.ctx)
	return nil
}
