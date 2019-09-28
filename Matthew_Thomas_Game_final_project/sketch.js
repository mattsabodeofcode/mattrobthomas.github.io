/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/


*/

/*
EXTENSION 1 - Adding Sound
Adding sound to the game was a very beneficial addition as it has made the game more realistic. I have added individual sounds for different actions or events. For example there is a sound for when the character picks up a collectable, when they die, when they jump and when they win the game. The sounds I picked are appropriate to the event based on my experience of games previously. I also added background music that I composed myself from scratch. 
What I found difficult for this extension was finding the appropriate places for the sound to be activated in the code, which I worked out correctly. Secondly, I found it difficult to find out why the music was not starting immediately when the game loads. My research showed that this is actually a function of the browser I am using (Google Chrome). It stops audio from being played instantly to benefit users of the browser that may not want that to happen. This can be turned off in the browser and was not something I needed to code into the game. It just requires the gamer to interact with the game first by jumping or picking up an item to trigger the music. I've now learnt how to use sound effectively to improve the gamer's experience.

EXTENSION 2 - Creating Enemies
For this extension what I found difficult was understanding the concept of how the function constructor works and usinng this to create multiple enemies, which I have managed to understand and complete now. There was an issue with checking when the contact had occurred with the enemy. It was too early on the left of the enemy and too late on the right. This took me a while to work out and I had tried various ways, but I realised I could adjust the offset in dist() by adding an amount correlating to the size of the enemy to the "currentX" of the enemy. I realised this when I discovered the X point of the enemy was on the left side of it.
I've now learnt how to use function constructors in a creative way and how this fits into the scope of the code. This has allowed me to create more elegant code and effective code.

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var collectables;
var canyons;
var mountains;
var clouds;
var enemyBirds;

var game_score;
var flagPole;
var lives;

var jumpSound;
var music;
var collectableSound;
var dieSound;
var completeSound;
var emit;
var platforms;


function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    music = loadSound('assets/mayaimi_music.wav');
    music.setVolume(0.1);
    collectableSound = loadSound('assets/sfx_coin_double1.wav');
    collectableSound.setVolume(0.1);
    dieSound = loadSound('assets/sfx_sounds_negative1.wav');
    dieSound.setVolume(0.1);
    completeSound = loadSound('assets/sfx_sounds_powerup18.wav');
    completeSound.setVolume(0.1);
}

//////// START OF SNOW
function Particle(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    this.age = 0; // how many frames it lives for
    
    this.drawParticle = function()
    {
        fill(this.colour);
        ellipse(this.x, this.y, this.size);
    }
    
    this.updateParticle = function()
    {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.age++;
    }
}

function Emitter(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    
    this.startParticles = 0;
    this.lifetime = 0;
    
    this.particles = [];
    
    
    this.addParticle = function()
    {
        var p = new Particle(random(this.x-500, this.x+500), 
                    random(this.y-500, this.y+500), 
                    random(this.xSpeed-1, this.xSpeed+1), 
                    random(this.ySpeed, this.ySpeed+4), 
                    random(this.size-4, this.size+4), 
                    this.colour);
        return p;
    }
    this.startEmitter = function(startParticles, lifetime)
    {
        this.startParticles = startParticles;
        this.lifetime = lifetime;
        
        //start emitter with initial particles
        for(var i = 0; i < startParticles; i++)
        {
            this.particles.push(this.addParticle());
        }
    }
    
    this.updateParticles = function()
    {
        //iterate through particles and draw to the screen
        var deadParticles = 0;
        for(var i = this.particles.length-1; i >= 0; i--)
        {
            this.particles[i].drawParticle();
            this.particles[i].updateParticle();
            if(this.particles[i].age > random(0, this.lifetime))
            {
                this.particles.splice(i, 1);
                deadParticles++;
            }
        }
        if(deadParticles > 0)
        {
            for(var i = 0; i < deadParticles; i++)
            {
                this.particles.push(this.addParticle());
            }
        }
    }
}

///////// END OF SNOW

function setup()
{
    music.play();
    createCanvas(1024, 576);
    lives = 3;
    textSize(20);
    emit = new Emitter(width/2, height/2, 0, 0, 1.4, color(255,255,255,255));
    emit.startEmitter(1000, 15000);
    startGame();
}


function startGame()
{
    floorPos_y = height * 3/4;
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    
    trees_x = [100, 300, 500, 1000, -300, 1200,1300,1400, 1800,-600,-1200,-1500-900,1800,2200,2300,2454,2540,2800,3200];
    
    collectables = [
        {x: 700, y: floorPos_y - 20, isFound: false},
        {x: 300, y: floorPos_y - 20, isFound: false,},
        {x: 1000, y: floorPos_y - 20, isFound: false},
        {x: -267, y: floorPos_y - 20, isFound: false},
        {x: -754, y: floorPos_y - 20, isFound: false},
        {x: 821, y: floorPos_y - 20, isFound: false},
        {x: 2100, y: floorPos_y - 20, isFound: false},
        {x: 2700, y: floorPos_y - 20, isFound: false}
    ];
    
    canyons = [
        {x: 50, width: 25},
        {x: -650, width: 25},
        {x: 740, width: 50},
        {x: 1650, width: 80},
        {x: 3000, width: 100}
    ];
    
    mountains = [
        {x: 340, y: floorPos_y, height: 150, width: 300},
        {x: 900, y: floorPos_y, height: 240, width: 200},
        {x: 1200, y: floorPos_y, height: 100, width: 350},
        {x: -600, y: floorPos_y, height: 400, width: 600},
        {x: 1800, y: floorPos_y, height: 380, width: 400},
        {x: 2300, y: floorPos_y, height: 180, width: 400},
        {x: 2400, y: floorPos_y, height: 200, width: 400},
        {x: 2600, y: floorPos_y, height: 240, width: 400}
    ];
    
    clouds = [];
    for(i = 0; i < 80; i++)
    {
        clouds.push(
        {
            x: random(-5000, 5000),
            y: random(120, 200),
            size: random(0.4, 1.9),
            speed: random(0.04, 0.35),
            colour: random(180,255)
        });
    }
    
    game_score = 0;
    
    flagPole = {isReached: false, x: 2400};
    
    platforms = [];
    
    platforms.push(CreatePlatforms(720,floorPos_y - 100,100));
    platforms.push(CreatePlatforms(1000,floorPos_y - 150,100));
    platforms.push(CreatePlatforms(1200,floorPos_y - 200,100));
    
    enemyBirds = [];
    enemyBirds.push(new Enemy(100, floorPos_y - 10, 100));
    enemyBirds.push(new Enemy(1900, floorPos_y - 10, 100));
    enemyBirds.push(new Enemy(820, floorPos_y - 10, 100));
    enemyBirds.push(new Enemy(1420, floorPos_y - 10, 100));
    enemyBirds.push(new Enemy(-420, floorPos_y - 10, 100));

}

function draw()
{
    // Fill the sky
	background(155, 155, 155);

	// Sun
    fill(250,200,0,60);
    ellipse(80,100,100,100);
    
    // Snow Emitter
    emit.updateParticles();
    
    noStroke();
	fill(0,100,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    //scrolling
    push();
	translate(scrollPos, 0);
    
	// Draw clouds.
    for(var i = 0; i < clouds.length; i++)
    {
        fill(clouds[i].colour);
        ellipse(
            clouds[i].x,
            clouds[i].y,
            50*clouds[i].size,
            50*clouds[i].size);

        ellipse(
            clouds[i].x+30*clouds[i].size,
            clouds[i].y,
            30*clouds[i].size,
            30*clouds[i].size);
        
        ellipse(
            clouds[i].x+50*clouds[i].size,
            clouds[i].y,
            20*clouds[i].size,
            20*clouds[i].size);
        
        clouds[i].x += clouds[i].speed;
    }

	// Draw mountains.
    for(var i = 0; i < mountains.length; i++)
    {
        fill(120);
        triangle(
            mountains[i].x, 
            mountains[i].y,
            mountains[i].x + mountains[i].width, 
            mountains[i].y,
            mountains[i].x + (mountains[i].width / 2), 
            mountains[i].y - mountains[i].height);
    }

	// Draw trees.
    drawTrees();

	// Draw canyons.
    for(var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
    
    // Draw platforms
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
	// Draw collectable items.
    for(var i = 0; i < collectables.length; i++)
    {
        if(!collectables[i].isFound)
        {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        } 

    }
    
    renderFlagPole();
    
    for(var i = 0; i < enemyBirds.length; i++)
    {
        enemyBirds[i].draw();
        var isContact = enemyBirds[i].checkContact(gameChar_world_x, gameChar_y);
        if(isContact)
        {
            if(lives > 0)
            {
                lives -=1;
                startGame();
                break;
            }
        }
    }
    
    pop();

	// Draw game character.
	drawGameChar();
    checkPlayerDie();
    
    fill(255);
    noStroke();
    textSize(28);
    text("score: " + game_score, 20, 40);
    
    //Logic for if character dies or completes level
    function checkPlayerDie()
    {
        if(gameChar_y > height)
        {
            lives -= 1;
            dieSound.play();
            startGame();
        }
    }
    
    if(lives < 1)
    {
        text("GAME OVER", width/2*0.75, height/2);
        text("Press space to continue", width/2*0.75, height/3);
        spaceRestart();
        return;
    } 

    else if(flagPole.isReached)
    {
        isLeft = false;
        isRight = false;
        text("LEVEL COMPLETE!", width/2*0.75, height/2);
        text("Press space to continue", width/2*0.75, height/3);
        spaceRestart();
        return;
    }
    

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}
    
	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
    {
        var isContact = false;
        for(var i = 0; i < platforms.length; i++)
        {
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
            {
                isContact = true;
                isFalling = false;
                break;
            }
        }
        if(!isContact)
        {
            gameChar_y += 2;
            isFalling = true;
        }
    }
    else
    {
        isFalling = false;
    }
    
    if(isPlummeting)
    {
        gameChar_y += 10;
    }
    
    // calling check flag pole function
    if(!flagPole.isReached)
    {
        checkFlagPole();
    }
        
    // draw life coins
    for(i = 0; i < lives; i++)
    {
        fill(255,200,200);
        ellipse(40 + i * 50, height - 50, 40, 40);
    }
    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}
    


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
	if (key == 'A' || keyCode == 37)
    {
        isLeft = true;
    }
    
    if(key == 'D' || keyCode == 39)
    {
        isRight = true;
    }
    
    if(key == ' ' || key == 'W')
    {
        if(!isFalling)
        {
            gameChar_y -= 150;
            jumpSound.play();
        }
    }  

}

function keyReleased()
{

    if (key == 'A' || keyCode == 37)
    {
        isLeft = false;
    }
    
    if(key == 'D' || keyCode == 39)
    {
        isRight = false;
    }
    
}

function spaceRestart()
{
    if(keyCode === 32 || key === ' ')
    {
        lives = 3;
        startGame();
    }
    return;
}



// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    if(isLeft && isFalling)
	{
		// Jumping left code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-8,gameChar_y-35,16,30);
        fill(0);
        rect(gameChar_x-12,gameChar_y-15,14,10);
        fill(0);
        rect(gameChar_x,gameChar_y-45,6,15);
        
        fill(255);
        ellipse(gameChar_x-8,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x-9,gameChar_y-49,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);
	}
	else if(isRight && isFalling)
	{
		// Jumping right code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-8,gameChar_y-35,16,30);
        fill(0);
        rect(gameChar_x-2,gameChar_y-15,14,10);
        fill(0);
        rect(gameChar_x-6,gameChar_y-45,6,15);
        
        fill(255);
        ellipse(gameChar_x+8,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x+9,gameChar_y-49,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);
	}
	else if(isLeft)
	{
		// Walking left code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-8,gameChar_y-35,16,30);
        fill(0);
        rect(gameChar_x-12,gameChar_y-10,14,10);
        fill(0);
        rect(gameChar_x,gameChar_y-35,6,20);
        
        fill(255);
        ellipse(gameChar_x-8,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x-9,gameChar_y-50,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);
	}
	else if(isRight)
	{
		// Walking right code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-8,gameChar_y-35,16,30);
        fill(0);
        rect(gameChar_x-2,gameChar_y-10,14,10);
        fill(0);
        rect(gameChar_x-6,gameChar_y-35,6,20);
        
        fill(255);
        ellipse(gameChar_x+8,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x+9,gameChar_y-50,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);
	}
	else if(isFalling || isPlummeting)
	{
		// Jumping facing forwards code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-13,gameChar_y-35,26,30);
        fill(0);
        rect(gameChar_x-18,gameChar_y-10,10,10);
        fill(0);
        rect(gameChar_x+8,gameChar_y-10,10,10);
        fill(0);
        rect(gameChar_x-18,gameChar_y-50,6,20);
        fill(0);
        rect(gameChar_x+12,gameChar_y-50,6,20);
        
        fill(255);
        ellipse(gameChar_x-6,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x-6,gameChar_y-51,7,7);
        fill(255);
        ellipse(gameChar_x+6,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x+6,gameChar_y-51,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);
	}
	else
	{
		// Front facing code
        fill(200,150,150);
        ellipse(gameChar_x,gameChar_y-50,35);
        fill(255,0,0);
        rect(gameChar_x-13,gameChar_y-35,26,30);
        fill(0);
        rect(gameChar_x-15,gameChar_y-5,10,10);
        fill(0);
        rect(gameChar_x+5,gameChar_y-5,10,10);
        fill(0);
        rect(gameChar_x-18,gameChar_y-35,6,20);
        fill(0);
        rect(gameChar_x+12,gameChar_y-35,6,20);
        
        fill(255);
        ellipse(gameChar_x-6,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x-6,gameChar_y-49,7,7);
        fill(255);
        ellipse(gameChar_x+6,gameChar_y-50,10,10);
        fill(0);
        ellipse(gameChar_x+6,gameChar_y-49,7,7);
        
        fill(50,50,255);
        beginShape();
        curveVertex(gameChar_x-20, gameChar_y+70);
        curveVertex(gameChar_x-20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y-55);
        curveVertex(gameChar_x+20, gameChar_y+70);
        endShape();
        fill(255);
        ellipse(gameChar_x,gameChar_y-74,15,15);   
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw trees objects.
function drawTrees()
{
    for(var i = 0; i < trees_x.length; i++)
    {
        fill(100, 50, 0);
        rect(75 + trees_x[i],
            -200/2 + floorPos_y, 
            50, 
            200/2);
        fill(0, 100, 0);
        triangle(trees_x[i], 
                 -200/4 + floorPos_y, 
                 trees_x[i] + 100, 
                 -200*3/4 + floorPos_y, 
                 trees_x[i] + 200, 
                 -200/4 + floorPos_y);
        fill(255);
        triangle(trees_x[i]+25, 
                 -200/2 + floorPos_y, 
                 trees_x[i] + 100, 
                 -200 + floorPos_y, 
                 trees_x[i] + 175, 
                 -200/2 + floorPos_y);
        fill(0,100,0);
        triangle(trees_x[i]+35, 
                 -130 + floorPos_y, 
                 trees_x[i] + 100, 
                 -240 + floorPos_y, 
                 trees_x[i] + 165, 
                 -130 + floorPos_y);
        fill(255);
        triangle(trees_x[i]+50, 
                 -160 + floorPos_y, 
                 trees_x[i] + 100, 
                 -240 + floorPos_y, 
                 trees_x[i] + 150, 
                 -160 + floorPos_y);
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    fill(80,50,0);
    rect(t_canyon.x, floorPos_y, t_canyon.width, height - floorPos_y);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
   if(gameChar_world_x > t_canyon.x && 
      gameChar_world_x < t_canyon.x + t_canyon.width && 
      gameChar_y >= floorPos_y)
   {
       isPlummeting = true;
       isLeft = false;
       isRight = false;
   }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to render the flag pole

function renderFlagPole()
{
    push();
    strokeWeight(5);
    stroke(255,200,0);
    line(flagPole.x, floorPos_y, flagPole.x, floorPos_y - 250);
    fill(255,100,50);
    noStroke();
    
    if(flagPole.isReached)
    {
        rect(flagPole.x, floorPos_y - 250, 60, 50);
    }
    else
    {
        rect(flagPole.x, floorPos_y - 50, 60, 50);        
    }
    pop();
}

function checkFlagPole()
{
    var d = abs(gameChar_world_x - flagPole.x);
    if(d < 25)
    {
        flagPole.isReached = true;
        completeSound.play();
    }
}


// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    push();
    fill(100,250,240);
    beginShape();
        vertex(t_collectable.x -10, t_collectable.y + 10);
        vertex(t_collectable.x, t_collectable.y + 35);
        vertex(t_collectable.x + 10, t_collectable.y + 10);
        vertex(t_collectable.x + 35, t_collectable.y);
        vertex(t_collectable.x + 10, t_collectable.y -8);
        vertex(t_collectable.x, t_collectable.y -35);
        vertex(t_collectable.x -10, t_collectable.y -8);
        vertex(t_collectable.x -35, t_collectable.y);
    endShape();
    pop();
} 


// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x, gameChar_y, t_collectable.x, t_collectable.y) < 52)
    {
        t_collectable.isFound = true;
        collectableSound.play();
        game_score += 1;
    }
}


function CreatePlatforms(x,y,length)
{
    var p = 
    {
        x: x,
        y: y,
        length: length,
        draw: function()
            {
                fill(random(100,140),random(0,40),random(150,170));
                rect(this.x, this.y, this.length, 20);
            },
        checkContact: function(gc_x, gc_y)
            {
                if(gc_x > this.x && gc_x < this.x + this.length)
                {
                    var d = this.y - gc_y;
                    if(d >= 0 && d < 5)
                    {
                        return true;
                    }
                }
                return false;
            }
    }
    return p;
}

function Enemy(x,y,range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1;
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range)
        {
            this.inc = -1
        }
        else if(this.currentX < this.x)
        {
            this.inc = 1;
        }
    }
    this.draw = function()
    {
        this.update();
            fill(255,200,0);
            noStroke();
            triangle(this.currentX, 
                     this.y,
                     this.currentX + 40, this.y - 25,
                     this.currentX, 
                     this.y - 50);
            fill(255);
            ellipse(this.currentX + 10, 
                    this.y -30, 
                    8, 
                    8);
            fill(0);
            ellipse(this.currentX + 11, 
                    this.y -30, 
                    4, 
                    4);
            fill(255,100,255);
            stroke(2);
            strokeWeight(2);
            line(this.currentX + 5, 
                 this.y - 40, 
                 this.currentX + 15, 
                 this.y - 35);
            line(this.currentX + 18, 
                 this.y - 20, 
                 this.currentX + 24, 
                 this.y - 18);
            fill(255,140,40);
            noStroke();
            beginShape();
                curveVertex(this.currentX-15, this.y -20); 
                curveVertex(this.currentX+10, this.y -20);
                curveVertex(this.currentX+5, this.y -10);
                curveVertex(this.currentX-10, this.y -20);
                curveVertex(this.currentX-15, this.y -20);
            endShape();
    }
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX + 20, this.y);
        if(d < 35)
        {
            dieSound.play();
            return true;
        }
        return false;
    }
}