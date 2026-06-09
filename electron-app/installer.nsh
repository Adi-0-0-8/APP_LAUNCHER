!macro customInit
  ; Force kill any running instance of AppLauncher BEFORE installation begins
  nsExec::ExecToStack "taskkill /f /im AppLauncher.exe"
  Sleep 500
!macroend
