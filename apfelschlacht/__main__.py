"""Entry point for python -m apfelschlacht."""

import arcade

from .constants import DEFAULT_APPLE_COUNT
from .game import ApfelschlachtGame


def main():
    window = ApfelschlachtGame()
    window.setup(DEFAULT_APPLE_COUNT)
    arcade.run()


main()
