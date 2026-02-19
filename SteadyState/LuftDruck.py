"""
Luftdruck

Vollkommen elastischer Stoss, Verteilung von Teilchen mit und ohne "Schwerkraft".

Steady State

Bildung und Zerall von Komplexen

"""

import random
import arcade
from collections import Counter
import time
from pathlib import Path
import math



#CONSTANTS
SCREEN_WIDTH  = 1200
SCREEN_HEIGHT = 800
SCREEN_TITLE  = "Luftdruck"



class particle(arcade.Sprite):
    def __init__(self, texture, center_x, center_y, motion=None, name="unknown", mass=1, xMotion=1, yMotion=1):
        super().__init__()
        self.texture = texture
        self.center_x = center_x
        self.center_y = center_y
        self.name = name
        if motion != None:
            self.change_x = random.randrange(-motion, motion)
            self.change_y = random.randrange(-motion, motion)
        else:
            self.change_x = xMotion
            self.change_y = yMotion
        self.mass = mass

    
           

class rView(arcade.Window):
    """ Our custom Window Class"""

    def __init__(self):
        """ Initializer """
        # Call the parent class initializer
        super().__init__(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_TITLE, resizable=True, update_rate=1/30)
        
        arcade.set_background_color(arcade.color.WHITE)
        self.timer = 0
        
        # Variables that will hold sprite lists
        self.atomXList = None
        self.atomYList = None
        self.complexList = None
        self.completeList = None
        # Game Update Frequency
        self.hertz = 30
        self.gameRun = False
        self.showHelp = False
        self.concX = 100
        self.concY = 0
        self.width = SCREEN_WIDTH
        self.height = SCREEN_HEIGHT
        self.particleDensity = Counter() 
        self.densitySection = 10
        self.xAtomRadius = 10
        self.yAtomRadius = 15 
        self.massX = 1
        self.massY = 2
        self.massC = self.massX + self.massY
        self.decayConstant =  1 / 10
        self.gravity = 0.2  # Gravitational constant
        self.gravityOn = False
        self.pauseScreenText = "PAUSE - für Hilfe \"H\" drücken"
        self.helpText="""X/x Anzahl der X Partikel erhöhen oder veringern\n
Y/y Anzahl der Y Partikel erhöhen oder verringer\n
Z/z Zerfallskonstante des Komplexes erhöhen oder verringern\n
+/- Geschwindigkeit der Simulation erhöhen oder verringern (soweit es die Hardware erlaubt)\n
A/D resp. W/S vergrössern oder verkleinern die Radien fon Atom X resp. Atom Y
G schaltet die Schwerkraft ein oder aus. Es empfiehlt sich ein Neustart nach dem Ausschalten.
\n
Leertaste - Pause """

    def setup(self, width=None, height=None,concX=None, concY=None):
        """ Set up the game and initialize the variables. """
        
        self.concX = concX if concX != None else self.concX
        self.concY = concY if concY != None else self.concY

        self.width = width if width != None else self.width
        self.height = height if height != None else self.width
        self.densitySectionHeight = (self.height - 200) // self.densitySection

        if self.completeList:
            self.atomXList.clear()
            self.atomYList.clear()
            self.complexList.clear()
            self.completeList.clear()


        self.massX = self.xAtomRadius / 10
        self.massY = self.yAtomRadius / 10
        self.massC = self.massX + self.massY
        self.complexRadius = self.xAtomRadius + self.yAtomRadius -5

        self.breakingComplexes = 0
        self.atomXList = arcade.SpriteList(use_spatial_hash=True)
        self.atomYList = arcade.SpriteList(use_spatial_hash=True)
        self.complexList = arcade.SpriteList(use_spatial_hash=True)
        self.completeList = arcade.SpriteList(use_spatial_hash=True)
        
        self.xTexture = arcade.make_circle_texture(self.xAtomRadius, arcade.color.BLUE)
        self.yTexture = arcade.make_circle_texture(self.yAtomRadius, arcade.color.RED)
        self.cTexture = arcade.make_soft_circle_texture(self.complexRadius, arcade.color.GREEN, 255, 100)
        

        for i in range(self.densitySection):
            self.particleDensity[i] = 0

        for _ in range(self.concX):
            ppos = self.placeParticle(self.xAtomRadius)
            x = particle(texture=self.xTexture, center_x=ppos[0], center_y=ppos[1], motion=5, name="X", mass=self.massX)
            self.atomXList.append(x)
            self.completeList.append(x)
            self.particleDensity[x.center_y // self.densitySectionHeight] += 1
        
        for _ in range(self.concY):
            ppos = self.placeParticle(self.yAtomRadius)
            y = particle(texture=self.yTexture,  center_x=ppos[0], center_y=ppos[1], motion=5, name="Y", mass=self.massY)
            self.atomYList.append(y)
            self.completeList.append(y)    
        
        for _ in self.particleDensity:
            print (_, self.particleDensity[_])

    def placeParticle(self, r):
        return [random.randrange(self.width - 2*r) + r, random.randrange(self.height - 200 - 2*r) + r]

    def changeHertz(self, change):
        self.hertz += change
        if (self.hertz < 10):
            self.hertz = 10
        self.set_update_rate(1/self.hertz)
    
    def on_resize(self, width, height):

        """Called whenever the window is resized."""
        super().on_resize(width, height)
        #self.setup(concX=self.concX, concY=self.concY)


    def on_draw(self):   
        """ Draw everything """
        self.clear()
        if not self.gameRun: 
            if not self.showHelp:
                arcade.draw_text(self.pauseScreenText, 10, self.height -150, arcade.color.BLACK, 20,  multiline = True, width = self.width)
            else:
                arcade.draw_text(self.helpText, 10, self.height - 150, arcade.color.BLACK, 20, multiline = True, width = self.width)
      
        output = f"X Partikel: {len(self.atomXList)}, Y Partikel: {len(self.atomYList)}, Komplexe: {len(self.complexList)} Simulationsgeschwindigkeit (Hertz): {self.hertz}"
        arcade.draw_text(output, 10, self.height -20, arcade.color.BLACK, 14)
        output = f"Zerfallskonstante Komplex: {round(self.decayConstant,2)}, Masse X: {self.massX}, Masse Y: {self.massY}"
        arcade.draw_text(output, 10, self.height -40, arcade.color.BLACK, 14)
        if not self.gravityOn:
            arcade.draw_line(0, self.height - 200, self.width, self.height - 200, arcade.color.BLACK,2)
        else:   
            output = f"Schwerkraft ist eingeschaltet"
            arcade.draw_text(output, 10, self.height -60, arcade.color.BLACK, 14)
        self.completeList.draw()

    def elastic_collision(self, sprite1, sprite2):
        """ Compute new velocities after an elastic collision with different masses """

        # Find the difference in positions
        dx = sprite1.center_x - sprite2.center_x
        dy = sprite1.center_y - sprite2.center_y
        distance = math.sqrt(dx**2 + dy**2)

        if distance == 0:  # Prevent division by zero
            return

        # Normalize the collision normal vector
        nx = dx / distance
        ny = dy / distance

        # Compute the relative velocity vector
        dvx = sprite1.change_x - sprite2.change_x
        dvy = sprite1.change_y - sprite2.change_y

        # Compute the velocity along the normal
        velocity_along_normal = dvx * nx + dvy * ny

        # If velocity is separating (moving away), no need to handle collision
        if velocity_along_normal > 0:
            return

        # Get masses
        m1 = sprite1.mass
        m2 = sprite2.mass
        
        # Compute impulse scalar using mass differences
        impulse = (2 * velocity_along_normal) / (m1 + m2)

        # Update velocities
        sprite1.change_x -= impulse * m2 * nx
        sprite1.change_y -= impulse * m2 * ny
        sprite2.change_x += impulse * m1 * nx
        sprite2.change_y += impulse * m1 * ny

    def on_update(self, delta_time):
        if not (self.gameRun):
            return
        self.timer += delta_time
        fixed_delta_time = 1 / self.hertz  # Fixed time step
        

        while self.timer >= fixed_delta_time:
            self.timer -= fixed_delta_time
        
                     
            self.completeList.update()
            self.breakingComplexes += self.decayConstant * fixed_delta_time * len(self.complexList)
            while self.breakingComplexes > 1:
                self.breakingComplexes -= 1
                self.breakComplex(random.choice(self.complexList))
            for s in self.completeList:
                if self.gravityOn:
                    s.change_y -= self.gravity  # Gravitational constant
                if s.left < 0: 
                    s.left = 0
                    s.change_x = abs(s.change_x)
                if s.right > self.width:
                    s.right = self.width
                    s.change_x = -abs(s.change_x)
                if s.bottom < 0: 
                    s.bottom = 0
                    s.change_y = abs(s.change_y) 
                if self.gravityOn == False and s.top > (self.height -200):
                    s.top = self.height - 200
                    s.change_y = -abs(s.change_y)

         
            for c in self.completeList:
                xxcolls = arcade.check_for_collision_with_list(c, self.completeList)
                if (len(xxcolls) > 0):
                    #print(f"Particel c {c} collided with {len(xxcolls)} other particles, handling only the first collision")
                    cc = xxcolls[0]

                    if (cc in self.atomXList and c in self.atomYList) or (cc in self.atomYList and c in self.atomXList):
                        #print(f"Complex needs to be formed between {c} and {cc}, name: {c.name} and {cc.name}")
                        self.formComplex(c, cc)
                        
                        #continue
                    else :
                        #print(f"Collision between {c} and {cc}, name: {c.name} and {cc.name}")
                        self.elastic_collision(c, cc)
                        
                    """else:
                        colFlag = True
                        #print(f" skipping {c}, it already collided, name {c.name}")
                    if c==cc:
                        print ("WTF")"""

            
                      
                
    def breakComplex(self,complex):
            #print (f"breaking complex  {complex}")
            if not self.gameRun:
                return
            #we set the half time of the complex, therefore in 50% of the cases the complex srtays intact
            xRand, yRand = random.uniform(-0.5, 0.5), random.uniform(-0.5, 0.5)
            xChangeX = complex.change_x + xRand
            xChangeY = complex.change_y + yRand
            yChangeX = complex.change_x - xRand
            yChangeY = complex.change_y - yRand

            atomDistance = (self.xAtomRadius + self.yAtomRadius) / 4

            xX = complex.center_x - atomDistance   
            xY = complex.center_y - atomDistance
            yX = complex.center_x + atomDistance
            yY = complex.center_y + atomDistance
            x = particle(texture=self.xTexture, center_x=xX, center_y=xY,  name = "X", xMotion = xChangeX, yMotion = xChangeY)
            y = particle(texture=self.yTexture, center_x=yX, center_y=yY,  name = "Y", xMotion=yChangeX, yMotion=yChangeY)
            
              
            self.atomXList.extend([x])
            self.atomYList.extend([y])
            self.completeList.extend([x])
            self.completeList.extend([y])
            self.complexList.remove(complex)
            self.completeList.remove(complex)
    

    def formComplex(self, xAtom, yAtom):
        if (xAtom not in self.atomXList) or (yAtom not in self.atomYList):
            #print("I should not form a complex, atom mmissing")
            return
        midX = (xAtom.center_x + yAtom.center_x) / 2
        midY = (xAtom.center_y + yAtom.center_y) / 2
        cX_change = (xAtom.change_x * xAtom.mass+ yAtom.change_x * yAtom.mass) / (xAtom.mass + yAtom.mass)
        cY_change = (xAtom.change_y * xAtom.mass+ yAtom.change_y * yAtom.mass) / (xAtom.mass + yAtom.mass)
            
        
        self.atomXList.remove(xAtom)
        self.atomYList.remove(yAtom)
        c = particle(texture=self.cTexture, center_x=midX, center_y=midY, name="C", mass=self.massC, xMotion=cX_change, yMotion=cY_change)
        self.complexList.append(c)
        self.completeList.append(c)
        self.completeList.remove(xAtom)
        self.completeList.remove(yAtom)

    def changeHertz(self, change):
        self.hertz += change
        if (self.hertz < 10):
            self.hertz = 10
        self.set_update_rate(1/self.hertz)

        
    def on_key_press(self, key, modifiers):
        # Called when the user presses a key.
        print("KEY PRESSED " + str(key) + ", and modifier pressed: " + str(modifiers))
        if key == arcade.key.SPACE:
            if self.gameRun:
                self.gameRun = False
            else:
                self.gameRun = True   
        if key == arcade.key.G:
            if self.gravityOn:
                self.gravityOn = False
            else:
                self.gravityOn = True  
        elif (key == arcade.key.PLUS or key == 65451):
            self.changeHertz(10)
        elif (key == arcade.key.MINUS or key == 65453):
            self.changeHertz (-10) 
        elif (key == arcade.key.X):
            self.gameRun = False
            if (modifiers == 1):
                self.concX += 10
            else:
                self.concX -= 10
            self.setup(concX=self.concX, concY=self.concY, width=self.width, height=self.height)
        elif (key == arcade.key.Y):
            self.gameRun = False
            if (modifiers == 1):
                self.concY += 10
            else:
                self.concY -= 10
            self.setup(concX=self.concX,concY=self.concY, width=self.width, height=self.height)
        elif (key == arcade.key.H):
            self.gameRun = False
            self.showHelp = True
        elif (key == arcade.key.Z):
            if (modifiers == 1):
                self.decayConstant += 0.05
            else:
                self.decayConstant -= 0.05
                if (self.decayConstant < 0):
                    self.decayConstant = 0
        elif (key == arcade.key.Q):
            self.xAtomRadius += 5
            if (self.xAtomRadius > 100):
                self.xAtomRadius = 100
            print (f"xAtomRadius now: {self.xAtomRadius}")
            self.setup(concX=self.concX,concY=self.concY, width=self.width, height=self.height)
        elif (key == arcade.key.A):
            self.xAtomRadius -= 5
            if (self.xAtomRadius < 10):
                self.xAtomRadius = 10
            print (f"xAtomRadius now: {self.xAtomRadius}")
            self.setup(concX=self.concX,concY=self.concY, width=self.width, height=self.height)
        elif (key == arcade.key.W):
            self.yAtomRadius += 5
            if (self.yAtomRadius > 100):
                self.yAtomRadius = 100
            print (f"yAtomRadius now: {self.yAtomRadius}")
            self.setup(concX=self.concX,concY=self.concY, width=self.width, height=self.height)
        elif (key == arcade.key.S):
            self.yAtomRadius -= 5
            if (self.yAtomRadius < 10):
                self.yAtomRadius = 10
            print (f"yAtomRadius now: {self.yAtomRadius}")
            self.setup(concX=self.concX,concY=self.concY, width=self.width, height=self.height)



    

def main():
    """ Main function """
    window = rView()
    window.setup(width=SCREEN_WIDTH, height=SCREEN_HEIGHT)
    arcade.run()

if __name__ == "__main__":
    main()