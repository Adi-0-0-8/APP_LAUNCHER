package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"syscall"
	"time"

	"github.com/getlantern/systray"
	"github.com/webview/webview"
	"golang.org/x/sys/windows/registry"
)

const (
	SERVER_URL = "https://app-launcher-u0x7.onrender.com"
	APP_NAME   = "AppLauncher"
	VERSION    = "1.0.7"
)

type App struct {
	ID          string    `json:"id"`
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	CustomName  string    `json:"customName"`
	Favicon     string    `json:"favicon"`
	Pinned      bool      `json:"pinned"`
	PublishedAt time.Time `json:"publishedAt"`
}

var (
	w           webview.WebView
	isExpanded  = false
	apps        []App
	currentX    = 0
	currentY    = 0
)

func main() {
	// Check if already running
	if isAlreadyRunning() {
		fmt.Println("App already running")
		os.Exit(0)
	}

	// Set auto-start
	setAutoStart()

	// Start system tray in background
	go func() {
		systray.Run(onReady, onExit)
	}()

	// Create webview window
	createWindow()
}

func createWindow() {
	debug := false
	w = webview.New(debug)
	defer w.Destroy()

	// Set window size and position
	w.SetTitle(APP_NAME)
	w.SetSize(6, 80, webview.HintFixed)

	// Load HTML content
	htmlContent := getHTMLContent()
	w.Navigate("data:text/html," + htmlContent)

	// Bind functions for JavaScript
	w.Bind("fetchURLs", fetchURLs)
	w.Bind("openURL", openURL)
	w.Bind("togglePin", togglePin)
	w.Bind("quitApp", quitApp)

	// Start mouse monitoring
	go monitorMouse()

	w.Run()
}

func getHTMLContent() string {
	// Read UI files
	htmlFile := filepath.Join("ui", "index.html")
	cssFile := filepath.Join("ui", "style.css")
	jsFile := filepath.Join("ui", "app.js")

	html, _ := os.ReadFile(htmlFile)
	css, _ := os.ReadFile(cssFile)
	js, _ := os.ReadFile(jsFile)

	// Inject CSS and JS inline
	content := string(html)
	content = replaceStyle(content, string(css))
	content = replaceScript(content, string(js))

	return content
}

func replaceStyle(html, css string) string {
	return html // Simplified for now - will add full implementation
}

func replaceScript(html, js string) string {
	return html // Simplified for now - will add full implementation
}

func fetchURLs() []App {
	resp, err := http.Get(SERVER_URL + "/urls")
	if err != nil {
		log.Println("Error fetching URLs:", err)
		return []App{}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var fetchedApps []App
	json.Unmarshal(body, &fetchedApps)
	apps = fetchedApps

	return apps
}

func openURL(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	cmd.Start()
}

func togglePin(appID string) bool {
	url := fmt.Sprintf("%s/urls/%s/pin", SERVER_URL, appID)
	req, _ := http.NewRequest("POST", url, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == 200
}

func quitApp() {
	systray.Quit()
	os.Exit(0)
}

func monitorMouse() {
	// Mouse monitoring logic
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for range ticker.C {
		x, y := getMousePosition()
		
		// Expand when mouse near left edge
		if !isExpanded && x <= 8 {
			isExpanded = true
			w.SetSize(110, 450, webview.HintNone)
			w.Eval("document.getElementById('sidebar').classList.remove('collapsed');")
		}

		// Collapse when mouse moves away
		if isExpanded && x > 120 {
			isExpanded = false
			w.SetSize(6, 80, webview.HintNone)
			w.Eval("document.getElementById('sidebar').classList.add('collapsed');")
		}
	}
}

func getMousePosition() (int, int) {
	// Windows API call to get cursor position
	var pt struct {
		X, Y int32
	}
	// Simplified - will add full Windows API implementation
	return int(pt.X), int(pt.Y)
}

func setAutoStart() {
	if runtime.GOOS != "windows" {
		return
	}

	exePath, _ := os.Executable()
	key, err := registry.OpenKey(registry.CURRENT_USER,
		`Software\Microsoft\Windows\CurrentVersion\Run`,
		registry.SET_VALUE)
	if err != nil {
		log.Println("Failed to open registry:", err)
		return
	}
	defer key.Close()

	err = key.SetStringValue(APP_NAME, exePath)
	if err != nil {
		log.Println("Failed to set auto-start:", err)
	}
}

func isAlreadyRunning() bool {
	// Check if another instance is running
	// Simplified implementation
	return false
}

func onReady() {
	systray.SetIcon(getIcon())
	systray.SetTitle(APP_NAME)
	systray.SetTooltip(APP_NAME + " " + VERSION)

	mShow := systray.AddMenuItem("Show", "Show window")
	mQuit := systray.AddMenuItem("Quit", "Quit the app")

	go func() {
		for {
			select {
			case <-mShow.ClickedCh:
				// Show window logic
			case <-mQuit.ClickedCh:
				quitApp()
			}
		}
	}()
}

func onExit() {
	// Cleanup
}

func getIcon() []byte {
	iconData, _ := os.ReadFile("icon.ico")
	return iconData
}
