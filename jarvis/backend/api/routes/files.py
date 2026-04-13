"""
J.A.R.V.I.S — Files API Route
POST /api/files/search — Search for files.
"""

from fastapi import APIRouter
from backend.models.schemas import FileSearchRequest

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/search")
async def search_files(request: FileSearchRequest):
    """Search for files on the filesystem."""
    from desktop_agent.file_search import FileSearch
    return FileSearch.search(
        directory=request.directory,
        pattern=request.pattern,
        file_type=request.file_type,
        max_results=request.max_results,
    )


@router.get("/recent")
async def recent_files(directory: str = "~", count: int = 10):
    """Get recently modified files."""
    from desktop_agent.file_search import FileSearch
    return FileSearch.get_recent_files(directory, count)
