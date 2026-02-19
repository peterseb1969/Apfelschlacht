"""Player and MovingObject classes for Apfelschlacht."""

import random
from collections import deque

import arcade

from .constants import (
    Algorithm,
    SPRITE_SCALING_PLAYER,
    SPRITE_FRAME_COUNT,
    MIN_SPEED,
    MAX_SPEED,
    VALUES_FOR_AVERAGE,
    DEFAULT_SPEED_APPLE,
)

TEXTURE_PATHS = {
    "boy": ":resources:images/animated_characters/female_person/femalePerson_walk{}.png",
    "man": ":resources:images/animated_characters/male_person/malePerson_walk{}.png",
}


class MovingObject:
    """A sprite moving toward a destination at a fixed speed."""

    def __init__(self, dest_x, dest_y, speed, sprite_obj):
        self.sprite_obj = sprite_obj
        dist = arcade.get_distance(
            sprite_obj.center_x, sprite_obj.center_y, dest_x, dest_y
        )
        self.steps = int(dist / speed)
        self.delta_x = (dest_x - sprite_obj.center_x) / self.steps
        self.delta_y = (dest_y - sprite_obj.center_y) / self.steps

    def move(self):
        if self.steps > 0:
            self.steps -= 1
            self.sprite_obj.center_x += self.delta_x
            self.sprite_obj.center_y += self.delta_y
            return True
        return False


class Player:
    """A player character that collects and throws apples."""

    def __init__(self, name, position, screen_dimensions):
        self.name = name
        self.fly_apples = 0
        self.speed_apple = DEFAULT_SPEED_APPLE
        self.fly_apple_numbers = deque()
        self.avg_dist = deque()
        self.screen_width = screen_dimensions[0]
        self.screen_height = screen_dimensions[1]
        self.speed = 6 if name == "boy" else 3
        self.steps = 0
        self.delta_x = 0
        self.delta_y = 0
        self.my_apples = arcade.SpriteList()
        self.next_apple = None
        self.objs_in_motion = []
        self.sprite_frame = 0
        self.sprite_time = 0
        self.combustion_time = 0
        self.texture_offset = 0

        self.sprite = arcade.Sprite()
        self.sprite.center_x = position[0]
        self.sprite.center_y = position[1]

        template = TEXTURE_PATHS[name]
        textures = [
            arcade.load_texture(template.format(i))
            for i in range(SPRITE_FRAME_COUNT)
        ]
        # Duplicate for facing direction (original behavior: indices 8-15 mirror 0-7)
        self.sprite.textures = textures + textures
        self.sprite.texture = self.sprite.textures[0]
        self.sprite.scale = SPRITE_SCALING_PLAYER

    def change_speed(self, change):
        self.speed = max(MIN_SPEED, min(MAX_SPEED, self.speed + change))

    def find_next_apple(self, algorithm, stats_recorder=None):
        nearest_apple = None
        dist = float("inf")
        x = self.sprite.center_x
        y = self.sprite.center_y

        if algorithm == Algorithm.NEAREST_APPLE:
            for apple in self.my_apples:
                a_dist = arcade.get_distance(x, y, apple.center_x, apple.center_y)
                if a_dist < dist:
                    dist = a_dist
                    nearest_apple = apple

        elif algorithm == Algorithm.RANDOM:
            if len(self.my_apples) > 0:
                nearest_apple = self.my_apples[random.randrange(len(self.my_apples))]
                dist = arcade.get_distance(
                    x, y, nearest_apple.center_x, nearest_apple.center_y
                )

        if algorithm != Algorithm.SPONTANEOUS_COMBUSTION:
            if nearest_apple is not None:
                self.avg_dist.append(dist)
                if len(self.avg_dist) > VALUES_FOR_AVERAGE:
                    self.avg_dist.popleft()
                    if stats_recorder:
                        stats_recorder.record_distance(self.name, dist)
                self.steps = int(dist / self.speed) or 1
                self.delta_x = (nearest_apple.center_x - x) / self.steps
                self.delta_y = (nearest_apple.center_y - y) / self.steps
                self.next_apple = nearest_apple
        else:
            self._spontaneous_combustion()

    def _spontaneous_combustion(self):
        combusting_apples = 0
        if self.combustion_time > (1 / self.speed):
            if len(self.my_apples) > 0:
                combusting_apples = round(
                    random.randrange(len(self.my_apples))
                    * (0.05 + self.speed / 100)
                )
                self.combustion_time = 0

        while len(self.my_apples) > 0 and combusting_apples > 0:
            apple = self.my_apples[round(random.randrange(combusting_apples))]
            combusting_apples -= 1
            offset = self.screen_width / 2 + 20 if self.name == "man" else 0
            dest_x = random.randrange(int(self.screen_width / 2 - 20)) + offset + 10
            dest_y = random.randrange(self.screen_height - 220) + 10
            fly_apple = MovingObject(dest_x, dest_y, self.speed_apple, apple)
            self.fly_apples += 1
            self.objs_in_motion.append(fly_apple)
            self.my_apples.remove(apple)
