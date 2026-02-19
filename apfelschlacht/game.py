"""Main game window for Apfelschlacht."""

import random
import time
from pathlib import Path

import arcade

from .constants import (
    Algorithm,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_TITLE,
    SPRITE_SCALING_APPLE,
    SPRITE_FRAME_COUNT,
    SPRITE_FRAME_INTERVAL,
    DEFAULT_HERTZ,
    DEFAULT_SPEED_APPLE,
    HUD_HEIGHT,
    MIN_HERTZ,
    VALUES_FOR_AVERAGE,
    PAUSE_SCREEN_TEXT,
)
from .player import Player, MovingObject
from .stats import StatsRecorder

APPLE_TEXTURE = Path(__file__).parent / "assets" / "apple.png"


class ApfelschlachtGame(arcade.Window):
    """Apfelschlacht — apple battle steady-state simulation."""

    def __init__(self):
        super().__init__(
            SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE,
            resizable=True, update_rate=1 / DEFAULT_HERTZ,
        )
        arcade.set_background_color(arcade.color.GREEN)

        self.all_apples = arcade.SpriteList()
        self.speed_apple = DEFAULT_SPEED_APPLE
        self.game_run = False
        self.hertz = DEFAULT_HERTZ
        self.time_since_tick = 0
        self.sim_run_time = 0
        self.sim_start_time = 0
        self.algorithm = Algorithm.NEAREST_APPLE
        self.stats = StatsRecorder()
        self.apple_count = 0
        self.old_man = None
        self.young_boy = None
        self.players = []

    def setup(self, apple_count):
        self.apple_count = apple_count
        self.players.clear()
        self.stats.clear()
        self.sim_run_time = 0
        self.sim_start_time = time.time()

        self.old_man = Player("man", [100, 100], [self.width, self.height])
        self.young_boy = Player(
            "boy", [self.width / 2 + 100, 100], [self.width, self.height]
        )
        self.players = [self.old_man, self.young_boy]

        self.all_apples.clear()
        for _ in range(self.apple_count):
            apple = arcade.Sprite(str(APPLE_TEXTURE), SPRITE_SCALING_APPLE)
            apple.center_x = (
                random.randrange(int(self.width / 2 - 20)) + self.width / 2 + 10
            )
            apple.center_y = random.randrange(self.height - 220) + 10
            self.all_apples.append(apple)
            self.young_boy.my_apples.append(apple)

    def _change_hertz(self, change):
        self.hertz = max(MIN_HERTZ, self.hertz + change)
        self.set_update_rate(1 / self.hertz)

    def on_resize(self, width, height):
        super().on_resize(width, height)
        self.setup(self.apple_count)

    def on_draw(self):
        self.clear()
        if not self.game_run:
            arcade.draw_text(
                PAUSE_SCREEN_TEXT, 10, self.height - 50,
                arcade.color.WHITE, 20, multiline=True, width=self.width,
            )
            return

        mid_x = self.width / 2
        hud_y = self.height - HUD_HEIGHT

        arcade.draw_line(mid_x, 0, mid_x, hud_y, arcade.color.BLACK, 2)
        arcade.draw_line(0, hud_y, self.width, hud_y, arcade.color.BLACK, 2)

        self.all_apples.draw()
        if self.algorithm != Algorithm.SPONTANEOUS_COMBUSTION:
            self.old_man.sprite.draw()
            self.young_boy.sprite.draw()

        algo_labels = {
            Algorithm.NEAREST_APPLE: "Nächster Apfel",
            Algorithm.RANDOM: "Zufälliger Apfel",
            Algorithm.SPONTANEOUS_COMBUSTION: "Spontaner Apfelflug",
        }
        arcade.draw_text(
            f"Modus: {algo_labels[self.algorithm]}, "
            f"Simulationsgeschwindigkeit (Hertz): {self.hertz}, "
            f"Simulations-Dauer: {round(self.sim_run_time, 2)}",
            10, self.height - 20, arcade.color.WHITE, 14,
        )

        arcade.draw_text(
            f"Geschwindigkeit alter Mann: {self.old_man.speed}",
            10, self.height - 40, arcade.color.WHITE, 14,
        )
        arcade.draw_text(
            f"Geschwindigkeit Junge: {self.young_boy.speed}",
            mid_x + 10, self.height - 40, arcade.color.WHITE, 14,
        )

        arcade.draw_text(
            f"Äpfel alter Mann: {len(self.old_man.my_apples)}",
            10, self.height - 80, arcade.color.WHITE, 14,
        )
        arcade.draw_text(
            f"Äpfel Junge: {len(self.young_boy.my_apples)}",
            mid_x + 10, self.height - 80, arcade.color.WHITE, 14,
        )

        arcade.draw_text(
            f"Äpfel links nach rechts: {self.old_man.fly_apples}",
            10, self.height - 100, arcade.color.WHITE, 14,
        )
        arcade.draw_text(
            f"Äpfel rechts nach links: {self.young_boy.fly_apples}",
            mid_x + 10, self.height - 100, arcade.color.WHITE, 14,
        )

        self._draw_player_averages(self.old_man, 10)
        self._draw_player_averages(self.young_boy, mid_x + 10)

        arcade.draw_text(
            f"Geschwindigkeit Äpfel: {self.old_man.speed_apple}",
            10, self.height - 160, arcade.color.WHITE, 14,
        )

    def _draw_player_averages(self, player, x):
        avg_apples = 0
        avg_dist = 0
        if len(player.fly_apple_numbers) > 9:
            avg_apples = round(
                sum(player.fly_apple_numbers) / len(player.fly_apple_numbers), 2
            )
        if len(player.avg_dist) > 9:
            avg_dist = round(sum(player.avg_dist) / len(player.avg_dist), 2)

        if player.name == "man":
            arcade.draw_text(
                f"Durchschnitt Äpfel -> {avg_apples}",
                x, self.height - 120, arcade.color.WHITE, 14,
            )
        else:
            arcade.draw_text(
                f"Durchschnitt Äpfel <-: {avg_apples}",
                x, self.height - 120, arcade.color.WHITE, 14,
            )

        if self.algorithm != Algorithm.SPONTANEOUS_COMBUSTION:
            arcade.draw_text(
                f"durchschn. Entfernung zum nächsten Apfel -> {avg_dist}",
                x, self.height - 140, arcade.color.WHITE, 14,
            )

    def on_update(self, dt):
        if not self.game_run:
            return

        self.time_since_tick += dt
        self.sim_run_time += dt

        for p in self.players:
            p.combustion_time += dt
            if self.time_since_tick > 1:
                p.fly_apple_numbers.append(p.fly_apples)
                if len(p.fly_apple_numbers) > VALUES_FOR_AVERAGE:
                    p.fly_apple_numbers.popleft()
                if len(p.avg_dist) > VALUES_FOR_AVERAGE:
                    p.avg_dist.popleft()

            p.sprite_time += dt
            if p.sprite_time > SPRITE_FRAME_INTERVAL:
                p.sprite_time = 0
                p.sprite_frame = (p.sprite_frame + 1) % SPRITE_FRAME_COUNT
                p.texture_offset = SPRITE_FRAME_COUNT if p.delta_x < 0 else 0
                p.sprite.texture = p.sprite.textures[
                    p.sprite_frame + p.texture_offset
                ]

        if self.time_since_tick > 1:
            self.stats.record_apples(
                self.players[0].name, self.players[0].fly_apples,
                len(self.players[0].my_apples),
                self.players[1].name, self.players[1].fly_apples,
                len(self.players[1].my_apples),
            )
            self.time_since_tick = 0

        for p in self.players:
            if (p.next_apple is not None
                    and self.algorithm != Algorithm.SPONTANEOUS_COMBUSTION):
                if p.steps > 0:
                    p.steps -= 1
                    p.sprite.center_x += p.delta_x
                    p.sprite.center_y += p.delta_y
                else:
                    offset = (
                        self.width / 2 + 20 if p.name == "man" else 0
                    )
                    dest_x = (
                        random.randrange(int(self.width / 2 - 20)) + offset + 10
                    )
                    dest_y = random.randrange(self.height - 220) + 10
                    fly_apple = MovingObject(
                        dest_x, dest_y, self.speed_apple, p.next_apple,
                    )
                    if dest_x > self.width / 2:
                        self.old_man.fly_apples += 1
                        self.old_man.objs_in_motion.append(fly_apple)
                    else:
                        self.young_boy.fly_apples += 1
                        self.young_boy.objs_in_motion.append(fly_apple)
                    p.my_apples.remove(p.next_apple)
                    p.next_apple = None
            elif p.next_apple is None:
                p.find_next_apple(self.algorithm, self.stats)

        for p in self.players:
            for obj in p.objs_in_motion:
                if not obj.move():
                    p.objs_in_motion.remove(obj)
                    if p.name == "man":
                        self.young_boy.my_apples.append(obj.sprite_obj)
                    else:
                        self.old_man.my_apples.append(obj.sprite_obj)
                    p.fly_apples -= 1
                    if p.fly_apples < 0:
                        print(f"Oha, {p.name} fly apples unter null")
            if self.algorithm == Algorithm.SPONTANEOUS_COMBUSTION:
                p.find_next_apple(self.algorithm, self.stats)

    def on_close(self):
        if not self.game_run:
            self.stats.save()
        super().on_close()

    def on_mouse_press(self, x, y, button, key_modifiers):
        if button == arcade.MOUSE_BUTTON_LEFT:
            self._change_hertz(10)
        if button == arcade.MOUSE_BUTTON_RIGHT:
            self._change_hertz(-10)

    def on_key_press(self, key, modifiers):
        if key == arcade.key.SPACE:
            self.game_run = not self.game_run
        elif key == arcade.key.W:
            self.apple_count += 50
            self.setup(self.apple_count)
        elif key == arcade.key.S:
            self.apple_count -= 50
            if self.apple_count < 0:
                self.apple_count = 50
            self.setup(self.apple_count)
        elif key in (arcade.key.PLUS, arcade.key.NUM_ADD):
            self._change_hertz(10)
        elif key in (arcade.key.MINUS, arcade.key.NUM_SUBTRACT):
            self._change_hertz(-10)
        elif key == arcade.key.O:
            self.old_man.change_speed(1)
        elif key == arcade.key.L:
            self.old_man.change_speed(-1)
        elif key == arcade.key.J:
            self.young_boy.change_speed(1)
        elif key == arcade.key.N:
            self.young_boy.change_speed(-1)
        elif key == arcade.key.A:
            self.old_man.speed_apple += 1
            self.young_boy.speed_apple += 1
        elif key == arcade.key.Y:
            self.old_man.speed_apple -= 1
            self.young_boy.speed_apple -= 1
            if self.old_man.speed_apple < 1:
                self.old_man.speed_apple = 1
                self.young_boy.speed_apple = 1
        elif key == arcade.key.KEY_1:
            self.algorithm = Algorithm.NEAREST_APPLE
            self.setup(self.apple_count)
        elif key == arcade.key.KEY_2:
            self.algorithm = Algorithm.RANDOM
            self.setup(self.apple_count)
        elif key == arcade.key.KEY_3:
            self.algorithm = Algorithm.SPONTANEOUS_COMBUSTION
            self.setup(self.apple_count)
