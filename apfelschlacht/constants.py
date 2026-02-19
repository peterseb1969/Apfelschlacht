"""Constants and enumerations for Apfelschlacht."""

import enum


class Algorithm(enum.Enum):
    NEAREST_APPLE = "NEAREST_APPLE"
    RANDOM = "RANDOM"
    SPONTANEOUS_COMBUSTION = "SPONTANEOUS_COMBUSTION"


SPRITE_SCALING_PLAYER = 0.5
SPRITE_SCALING_APPLE = 0.05

SCREEN_WIDTH = 1600
SCREEN_HEIGHT = 800
SCREEN_TITLE = "Apfelschlacht"

DEFAULT_SPEED_OLD_MAN = 3
DEFAULT_SPEED_BOY = 6
DEFAULT_SPEED_APPLE = 8
DEFAULT_APPLE_COUNT = 150
DEFAULT_HERTZ = 60

MAX_STATS_ENTRIES = 10000
VALUES_FOR_AVERAGE = 10

MIN_SPEED = 1
MAX_SPEED = 50
MIN_HERTZ = 10

SPRITE_FRAME_COUNT = 8
SPRITE_FRAME_INTERVAL = 0.1

HUD_HEIGHT = 200

PAUSE_SCREEN_TEXT = """\
Leertaste drücken zum Starten / Pausieren
Linke / rechte Maustaste oder + / -: Geschwindigkeit erhöhen / verringern
w / s : Neustart mit 50 Äpfeln mehr / weniger
o / l: Geschwindigkeit des alten Mannes erhöhen / verringern
j / n: Geschwindigkeit des Jungen erhöhen / verringern
a / y: Geschwindigkeit der Äpfel erhöhen / verringern
1 / 2 / 3 Simulationsmodus einstellen: Nächster Apfel / Zufälliger Apfel / Spontaner Apfelflug
"""
