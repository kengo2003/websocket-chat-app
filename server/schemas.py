from pydantic import BaseModel, Field
from typing import Literal, Annotated
import time

USERNAME = Annotated[str, Field(min_length=1, max_length=32, strip_whitespace=True)]
TEXT = Annotated[str, Field(min_length=1, max_length=200, strip_whitespace=True)]


class ChatMessage(BaseModel):
    type: Literal["chat"]
    user: USERNAME
    text: TEXT
    ts: int = Field(default_factory=lambda: int(time.time() * 1000))
