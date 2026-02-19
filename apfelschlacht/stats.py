"""Statistics recording and CSV export for Apfelschlacht."""

import time
from pathlib import Path

from .constants import MAX_STATS_ENTRIES


class StatsRecorder:
    def __init__(self):
        self.apple_stats = []
        self.dist_stats = []

    def clear(self):
        self.apple_stats.clear()
        self.dist_stats.clear()

    def record_apples(self, name1, fly_apples1, total_apples1,
                      name2, fly_apples2, total_apples2):
        self.apple_stats.append([
            time.time(), name1, fly_apples1, total_apples1,
            name2, fly_apples2, total_apples2,
        ])
        if len(self.apple_stats) > MAX_STATS_ENTRIES:
            self.apple_stats.clear()

    def record_distance(self, name, dist):
        self.dist_stats.append([time.time(), name, dist])
        if len(self.dist_stats) > MAX_STATS_ENTRIES:
            self.dist_stats.clear()

    def save(self, directory=None):
        if directory is None:
            directory = Path.home()
        directory = Path(directory)

        with open(directory / "appleStats.txt", "w") as f:
            f.write("time, name, flyingApples, totalApples, "
                    "name, flyingApples, totalApples\n")
            for row in self.apple_stats:
                f.write(", ".join(map(str, row)) + "\n")

        with open(directory / "distStats.txt", "w") as f:
            f.write("time, name, avgDistNextApple\n")
            for row in self.dist_stats:
                f.write(", ".join(map(str, row)) + "\n")
