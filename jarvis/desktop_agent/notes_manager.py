"""
J.A.R.V.I.S — Notes Manager
Create, list, and read notes stored as text files.
"""

import os
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("jarvis.notes")

DEFAULT_NOTES_DIR = os.path.expanduser("~/Documents/JarvisNotes")


class NotesManager:
    """Manage text notes stored in ~/Documents/JarvisNotes/."""

    def __init__(self, notes_dir: str = None):
        self.notes_dir = Path(os.path.expanduser(notes_dir or DEFAULT_NOTES_DIR))
        self.notes_dir.mkdir(parents=True, exist_ok=True)

    def create_note(self, content: str, title: str = None) -> dict:
        """Create a new note."""
        try:
            timestamp = datetime.now()
            if not title:
                title = timestamp.strftime("note_%Y%m%d_%H%M%S")

            # Sanitize filename
            safe_title = "".join(c if c.isalnum() or c in "-_ " else "" for c in title)
            safe_title = safe_title.strip().replace(" ", "_")[:80]
            filename = f"{safe_title}.txt"
            filepath = self.notes_dir / filename

            # Write note
            with open(filepath, "w") as f:
                f.write(f"# {title}\n")
                f.write(f"# Created: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(content)

            logger.info(f"Note created: {filepath}")
            return {
                "success": True,
                "message": f"Note saved: {title}",
                "data": {"file": str(filepath), "title": title},
            }
        except Exception as e:
            logger.error(f"Failed to create note: {e}")
            return {"success": False, "message": f"Failed to save note: {e}"}

    def list_notes(self, count: int = 10) -> dict:
        """List recent notes."""
        try:
            notes = sorted(
                self.notes_dir.glob("*.txt"),
                key=lambda f: f.stat().st_mtime,
                reverse=True,
            )[:count]

            note_list = []
            for note in notes:
                stat = note.stat()
                mtime = datetime.fromtimestamp(stat.st_mtime)
                note_list.append({
                    "name": note.stem,
                    "modified": mtime.strftime("%Y-%m-%d %H:%M"),
                    "size_bytes": stat.st_size,
                })

            msg = f"You have {len(note_list)} recent note{'s' if len(note_list) != 1 else ''}"
            if note_list:
                names = ", ".join(n["name"].replace("_", " ") for n in note_list[:5])
                msg += f": {names}"

            return {"success": True, "message": msg, "data": {"notes": note_list}}
        except Exception as e:
            return {"success": False, "message": f"Failed to list notes: {e}"}

    def read_note(self, name: str = None) -> dict:
        """Read the most recent note, or a specific note by name."""
        try:
            if name:
                # Search by name
                matches = [
                    f for f in self.notes_dir.glob("*.txt")
                    if name.lower() in f.stem.lower()
                ]
                if not matches:
                    return {"success": False, "message": f"No note found matching '{name}'"}
                filepath = matches[0]
            else:
                # Get most recent
                notes = sorted(
                    self.notes_dir.glob("*.txt"),
                    key=lambda f: f.stat().st_mtime,
                    reverse=True,
                )
                if not notes:
                    return {"success": False, "message": "No notes found"}
                filepath = notes[0]

            content = filepath.read_text()
            # Strip header comments
            lines = [l for l in content.split("\n") if not l.startswith("#")]
            clean = "\n".join(lines).strip()

            return {
                "success": True,
                "message": clean if clean else "Note is empty",
                "data": {"file": str(filepath), "content": clean},
            }
        except Exception as e:
            return {"success": False, "message": f"Failed to read note: {e}"}
