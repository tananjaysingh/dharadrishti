"""
J.A.R.V.I.S — File Search Agent
Search files on the filesystem.
"""

import os
import subprocess
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

logger = logging.getLogger("jarvis.file_search")


class FileSearch:
    """Search for files using find command and Python pathlib."""

    @staticmethod
    def search(
        directory: str = "~",
        pattern: str = "*",
        file_type: Optional[str] = None,
        max_results: int = 50,
    ) -> dict:
        """
        Search for files matching a pattern in a directory.
        
        Args:
            directory: Directory to search (supports ~)
            pattern: Glob pattern or filename to search  
            file_type: File extension filter (e.g., 'pdf', 'txt')
            max_results: Maximum results to return
        """
        directory = os.path.expanduser(directory)

        if not os.path.isdir(directory):
            return {"success": False, "message": f"Directory not found: {directory}", "results": []}

        try:
            # Build find command
            cmd = ["find", directory, "-maxdepth", "5"]

            # File type filter
            if file_type:
                file_type = file_type.lstrip(".")
                cmd.extend(["-name", f"*.{file_type}"])
            elif pattern != "*":
                cmd.extend(["-iname", f"*{pattern}*"])

            cmd.extend(["-type", "f", "-readable"])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
            )

            files = []
            for line in result.stdout.strip().split("\n"):
                if not line.strip():
                    continue
                try:
                    path = Path(line.strip())
                    if path.exists():
                        stat = path.stat()
                        files.append({
                            "path": str(path),
                            "name": path.name,
                            "size_bytes": stat.st_size,
                            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "file_type": path.suffix.lstrip(".") or "unknown",
                        })
                except (OSError, PermissionError):
                    continue

                if len(files) >= max_results:
                    break

            # Sort by modification time (newest first)
            files.sort(key=lambda x: x["modified"], reverse=True)

            return {
                "success": True,
                "message": f"Found {len(files)} files",
                "results": files,
                "directory": directory,
                "pattern": pattern,
            }

        except subprocess.TimeoutExpired:
            return {"success": False, "message": "Search timed out. Try a more specific directory.", "results": []}
        except Exception as e:
            logger.error(f"File search failed: {e}")
            return {"success": False, "message": f"Search failed: {e}", "results": []}

    @staticmethod
    def get_recent_files(directory: str = "~", count: int = 10) -> dict:
        """Get most recently modified files in a directory."""
        directory = os.path.expanduser(directory)
        try:
            cmd = [
                "find", directory, "-maxdepth", "3", "-type", "f",
                "-readable", "-printf", "%T@ %p\n",
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)

            files = []
            for line in sorted(result.stdout.strip().split("\n"), reverse=True):
                if not line.strip():
                    continue
                parts = line.split(" ", 1)
                if len(parts) == 2:
                    try:
                        path = Path(parts[1])
                        if path.exists() and not path.name.startswith("."):
                            stat = path.stat()
                            files.append({
                                "path": str(path),
                                "name": path.name,
                                "size_bytes": stat.st_size,
                                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                                "file_type": path.suffix.lstrip(".") or "unknown",
                            })
                    except (OSError, PermissionError):
                        continue
                if len(files) >= count:
                    break

            return {"success": True, "results": files}
        except Exception as e:
            return {"success": False, "message": str(e), "results": []}
