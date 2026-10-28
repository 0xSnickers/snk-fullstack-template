package logger

import (
	"io"
	"log/slog"
	"os"
	"path/filepath"
)

// Setup installs a JSON slog logger writing to stdout and, when file is set, to that file.
// The returned closer flushes/closes the file.
func Setup(level slog.Level, file string) (io.Closer, error) {
	var out io.Writer = os.Stdout
	var closer io.Closer = io.NopCloser(nil)
	if file != "" {
		if err := os.MkdirAll(filepath.Dir(file), 0o755); err != nil {
			return nil, err
		}
		f, err := os.OpenFile(file, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
		if err != nil {
			return nil, err
		}
		out, closer = io.MultiWriter(os.Stdout, f), f
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(out, &slog.HandlerOptions{Level: level})))
	return closer, nil
}
