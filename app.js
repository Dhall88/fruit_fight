$(() => {

    // Creates the initial canvas where the random terrain will live

let $canvas = $("#canvas")[0],
ctx = $canvas.getContext("2d"),
width = 1200,
height = 700;

$canvas.width = width;
$canvas.height = height;
$('.container').attr('width',`${width}px`);
$('.container').attr('height',`${height}px`);

// Global variable declaration

let $projectile = $('<div>');
let $cluster1 = $('<div>');
let $cluster2 = $('<div>');
let $cluster3 = $('<div>');
let $cluster4 = $('<div>');
let $cluster5 = $('<div>');
$('.container').append($projectile).append($cluster1).append($cluster2).append($cluster3)
.append($cluster4).append($cluster5);

let cluster1, cluster2, cluster3, cluster4, cluster5, $player1, 
$player2, player1, player2, $cannon1, $cannon2, ammoIndex2, 
ammoIndex1, currentProjectile,terPoints, wind;

let midAirBoolean=false;

// Generates terrain, this is modified code that I pulled from
// http://www.somethinghitme.com/2013/11/11/simple-2d-terrain-with-midpoint-displacement/

const terrain = (width, height, displace, roughness) => {
    let points = [],
        // Gives us a power of 2 based on our width
        power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

    // Set the initial left point
    points[0] = height / 2 + (Math.random() * displace * 2) - displace;
    // set the initial right point
    points[power] = height / 2 + (Math.random() * displace * 2) - displace;
    displace *= roughness;

    // Increase the number of segments
    for (let i = 1; i < power; i *= 2) {
        // Iterate through each segment calculating the center point
        for (let j = (power / i) / 2; j < power; j += power / i) {
            points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
            points[j] += (Math.random() * displace * 6) - displace
                while (points[j]>height/1.3-30) {
                    points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
                    points[j] += (Math.random() * displace * 2) - displace
                }
        }
        // reduce our random range
        displace *= roughness;
    }
    return points;
}

// Once a tank reaches zero health, creates a modal that announces the results
// and asks if the player would like to play again.
const win = (color) => {
    $('.end').show();
    $('.playAgain').on('click',gameStart);
    let $description = $('<p>').addClass('description').text(`Congratulations ${color}!
    Would you like to play again?`);
    $(".end").append($description);
}

// Adds tanks to the board with initial values

const addTanks = () => {
    player1 = new Tank(200,Math.round(terPoints[200]-5),'blue',45);
    $cannon1 = $('<div>').addClass('cannon').css({'left':`${player1.xPos}px`
        ,'top':`${player1.yPos-10}px`,'background-color': `${player1.color}`,'transform':`rotate(${90-player1.angle}deg)`});
    $player1 = $('<div>').addClass('tank').css({'left':`${player1.xPos-7}px`
        ,'top':`${player1.yPos}px`,'background-color': `${player1.color}`});
    player2 = new Tank(width-200,Math.round(terPoints[width-200]-5),'red',135);
    $cannon2 = $('<div>').addClass('cannon').css({'left':`${player2.xPos-1}px`
        ,'top':`${player2.yPos-10}px`,'background-color': `${player2.color}`,'transform':`rotate(${90-player2.angle}deg)`});
    $player2 = $('<div>').addClass('tank').css({'left':`${player2.xPos-7}px`
        ,'top':`${player2.yPos}px`,'background-color': `${player2.color}`});
    $('.container').append($player1).append($player2).append($cannon1).append($cannon2);
    
    // Adds both players initial stats to the stat board

    ammoIndex1 = 0;
    ammoIndex2 = 0;
    $('.health1').text(player1.health);
    $('.power1').text(player1.power);
    $('.angle1').text(player1.angle);
    $('.health2').text(player2.health);
    $('.power2').text(player2.power);
    $('.angle2').text(player2.angle);
    $('.ammo1').text(`${player1.ammoType[ammoIndex1]}: ${player1.ammo[ammoIndex1]}`)
    $('.ammo2').text(`${player2.ammoType[ammoIndex2]}: ${player2.ammo[ammoIndex2]}`)
}

// Creates the board, resets all critical values if playing again

const gameStart = () => {

    let win = $(window).width();
    $('.leftBorder').css('width',`${(win-width)/2}px`);
    $('.rightBorder').css('width',`${(win-width)/2}px`);
    $(window).on('resize', function(){
        let win = $(window).width()
        $('.leftBorder').css('width',`${(win-width)/2}px`);
        $('.rightBorder').css('width',`${(win-width)/2}px`);
    });

    // Clouds and sun, hide instructions and end game modal

    $('.cloud').css('animation-name','cloudTranslation')
    $('.sun').first().css('animation-name','sunFade');
    $('.end').hide();
    $('.instructions').hide();

    $('h5').on('click', () => {
        $('.instructions').show()
    })
    $('.close').on('click', () => {
        $('.instructions').hide();
    })

    // Wind Calculations and display

    wind = Math.floor(Math.random()*100-50);
    $('.wind').text(Math.abs(wind))
    $('.negDirection').hide();
    $('.posDirection').hide();
    if (wind<0){
        $('.negDirection').show();
    } else if (wind>0){
        $('.posDirection').show();
    } 

    // Removes any tanks currently on the board before replacing them 
    // with new tanks.
    
    $('.tank').remove();
    $('.cannon').remove();

    // Clears terrain before randomly generating new terrain

    ctx.clearRect(0,0,width,height);

    // Draws random terrain
    // get the points
    terPoints = terrain(width, height*1.3, height / 4, 0.45);
    // draw the points
    ctx.beginPath();
    ctx.moveTo(0, terPoints[0]);
    for (var t = 1; t < terPoints.length; t++) {
        ctx.lineTo(t, terPoints[t]);
    }
    // finish creating the rect so we can fill it
    ctx.lineTo($canvas.width, $canvas.height);
    ctx.lineTo(0, $canvas.height);
    ctx.closePath();
    ctx.fillStyle = "green"
    ctx.fill();

    player = true;

    addTanks();
}

class Tank {
    constructor(xPos, yPos, color, angle) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.color = color;
        this.health = 100;
        this.power = 60;
        this.angle = angle;
        this.tScale = .1;
        this.powerScale = .5;
        this.ammo=[99,3,3,3,1];
        this.ammoType=['Pear Bomb','Banana Cluster','Homing-dew Melon','Grapes of Wrath','Nuke-terine'];
        this.monkey = 1;
        
    }

    // Creates the appropriate projectile and modifies the accompanying div

    ammoSelection(num) {
        let vx = this.power*this.powerScale*Math.cos(this.angle*Math.PI/180);
        let vy = this.power*this.powerScale*Math.sin(this.angle*Math.PI/180);

        // Pear Bomb

        if (num===0) {
            let projectile = new Projectile(this.xPos,this.yPos,vx,vy,30);
            $projectile.show().css('animation-name','');
            $projectile.removeClass('explosion').addClass('projectile')
            .css({'background-image':`url("project-imgs/pear.png")`,'background-size':'100% 100%',});
            return projectile;

        // Banana Cluster

        } else if (num===1) {
            let projectile = new Projectile(this.xPos,this.yPos,vx,vy,25);
            $projectile.show().css('animation-name','');
            $projectile.attr('class','').addClass('projectile')
            .css({'background-image':`url("project-imgs/banana-bunch.png")`,'background-size':'100% 100%'});
            
            // cluster banana's that show once the initial cluster detinates

            cluster1 = new Projectile(0,0,
                (Math.random()*30)-15,Math.random()*10,20)
            cluster2 = new Projectile(0,0,
                (Math.random()*30)-15,Math.random()*10,20)
            cluster3 = new Projectile(0,0,
                (Math.random()*30)-15,Math.random()*10,20)
            cluster4 = new Projectile(0,0,
                (Math.random()*30)-15,Math.random()*10,20)
            cluster5 = new Projectile(0,0,
                (Math.random()*20)-10,Math.random()*10,20)
            $cluster1.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/single-banana.png")`,'background-size':'100% 100%'});
            $cluster2.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/single-banana.png")`,'background-size':'100% 100%'});
            $cluster3.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/single-banana.png")`,'background-size':'100% 100%'});
            $cluster4.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/single-banana.png")`,'background-size':'100% 100%'});
            $cluster5.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/single-banana.png")`,'background-size':'100% 100%'});
            return projectile;

            // Homing-dew Melon

             } else if (num===2){
            let projectile = new Projectile(this.xPos,this.yPos,vx,vy,25);
            $projectile.show().css('animation-name','');
            $projectile.removeClass('explosion').addClass('projectile')
            .css({'background-image':`url("project-imgs/melon.png")`,'background-size':'100% 100%'});
            return projectile;

        // Grapes of Wrath
            
        } else if (num===3) {
            let projectile = new Projectile(this.xPos,this.yPos,vx,vy,30);
            $projectile.show().css('animation-name','');
            $projectile.attr('class','').addClass('projectile')

            // Grapes that launch upon hitting 'c'

            .css({'background-image':`url("project-imgs/grape-bunch.png")`,'background-size':'100% 100%'});
            $cluster1.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/grape.png")`,'background-size':'100% 100%'});
            $cluster2.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/grape.png")`,'background-size':'100% 100%'});
            $cluster3.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/grape.png")`,'background-size':'100% 100%'});
            $cluster4.attr('class','').css('animation-name','').addClass('projectile').hide()
            .css({'background-image':`url("project-imgs/grape.png")`,'background-size':'100% 100%'});
            return projectile;

        // Nuke-terine

        } else {
            let projectile = new Projectile(this.xPos,this.yPos,vx,vy,75);
            $projectile.show().css('animation-name','');
            $projectile.removeClass('explosion').addClass('projectile')
            .css({'background-image':`url("project-imgs/tangerine.png")`,'background-size':'100% 100%'});
            return projectile;
        }         
    }

    // Handles the rendering of the projectile from the initial fire
    // Calls methods that handle specific projectile behavior

        fire(i,obj,$div,boolean,ammoIndex) {
            if (ammoIndex===0) {
                this.pearBomb(i,obj,$div)
            } else if (ammoIndex===1) {
                this.bananaCluster(i,obj,$div,boolean)
            } else if (ammoIndex===2) {
                this.homingMelon(i,obj,$div,boolean)
            } else if (ammoIndex===3) {
                this.grapesOfWrath(i,obj,$div,boolean) 
            } else {
                this.nuketerine(i,obj,$div)
            }
        }

    // Pear Bomb

    pearBomb (i,obj,$div) {
        setTimeout(() => {
            let coords = obj.path(i*this.tScale);
            $div.css('left',`${coords[0]}px`);
            $div.css('top',`${coords[1]}px`);
            if (obj.y<terPoints[Math.round(obj.x)-5]) {
                ++i;   
                this.pearBomb(i,obj,$div); 
            } else {
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
            }
        },10);
    }

    // Banana Cluster, handles initiating cluster bombs
        
    bananaCluster (i,obj,$div,boolean) {
        setTimeout(() => {
            let coords = obj.path(i*this.tScale);
            $div.css('left',`${coords[0]}px`);
            $div.css('top',`${coords[1]}px`);
            if (obj.y<terPoints[Math.round(obj.x)-5]) {
                ++i;   
                this.bananaCluster(i,obj,$div,boolean); 
            } else if (!boolean) {
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
                    $cluster1.show().css({'left':`${obj.x}px`,'top':`${obj.y+5}`})
                    $cluster2.show().css({'left':`${obj.x}px`,'top':`${obj.y+5}`})
                    $cluster3.show().css({'left':`${obj.x}px`,'top':`${obj.y+5}`})
                    $cluster4.show().css({'left':`${obj.x}px`,'top':`${obj.y+5}`})
                    $cluster5.show().css({'left':`${obj.x}px`,'top':`${obj.y+5}`})
                    cluster1.xO = cluster2.xO = cluster3.xO = cluster4.xO = cluster5.xO = obj.x; 
                    cluster1.yO = cluster2.yO = cluster3.yO = cluster4.yO = cluster5.yO = obj.y-20;
                    this.bananaCluster(0,cluster1,$cluster1,true)
                    this.bananaCluster(0,cluster2,$cluster2,true)
                    this.bananaCluster(0,cluster3,$cluster3,true)
                    this.bananaCluster(0,cluster4,$cluster4,true)
                    this.bananaCluster(0,cluster5,$cluster5,true)
            } else if (boolean){
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','small-explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
                    
            }
                }, 10)
            
    }

    // Homeing-dew Melon, handles the 'speed up'

    homingMelon (i,obj,$div,boolean) {
        setTimeout(() => {
            if (midAirBoolean){
                obj.vxO = obj.vx*4;
                obj.vyO = obj.vy*4;
                obj.xO = obj.x;
                obj.yO = obj.y;
                i=0;
                midAirBoolean=false;
            }
            let coords = obj.path(i*this.tScale);
            $div.css('left',`${coords[0]}px`);
            $div.css('top',`${coords[1]}px`);
            if (obj.y<terPoints[Math.round(obj.x)-5]) {
                ++i;   
                this.homingMelon(i,obj,$div,boolean); 
            } else {
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
                }
            },10)
    }

    // Grapes of Wrath, handles clusters

    grapesOfWrath (i,obj,$div,boolean) {
        setTimeout(() => {

            if (midAirBoolean) {
            $cluster1.show().css({'left':`${currentProjectile.x}px`,'top':`${currentProjectile.y}`})
            $cluster2.show().css({'left':`${currentProjectile.x}px`,'top':`${currentProjectile.y}`})
            $cluster3.show().css({'left':`${currentProjectile.x}px`,'top':`${currentProjectile.y}`})
            $cluster4.show().css({'left':`${currentProjectile.x}px`,'top':`${currentProjectile.y}`})
            cluster1 = new Projectile(currentProjectile.x,currentProjectile.y,
                currentProjectile.vx+(Math.random()*10-5),currentProjectile.vy+(Math.random()*10-5),20)
            cluster2 = new Projectile(currentProjectile.x,currentProjectile.y,
                currentProjectile.vx+(Math.random()*10-5),currentProjectile.vy+(Math.random()*10-5),20)
            cluster3 = new Projectile(currentProjectile.x,currentProjectile.y,
                currentProjectile.vx+(Math.random()*10-5),currentProjectile.vy+(Math.random()*10-5),20)
            cluster4 = new Projectile(currentProjectile.x,currentProjectile.y,
                currentProjectile.vx+(Math.random()*10-5),currentProjectile.vy+(Math.random()*10-5),20)
                this.grapesOfWrath(0,cluster1,$cluster1,true);
                this.grapesOfWrath(0,cluster2,$cluster2,true);
                this.grapesOfWrath(0,cluster3,$cluster3,true);
                this.grapesOfWrath(0,cluster4,$cluster4,true);
                midAirBoolean=false;
            }
            
            let coords = obj.path(i*this.tScale);
            $div.css('left',`${coords[0]}px`);
            $div.css('top',`${coords[1]}px`);
            if (obj.y<terPoints[Math.round(obj.x)-5]) {
                ++i;   
                this.grapesOfWrath(i,obj,$div,boolean); 
            } else if (boolean === true) {
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','small-explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
            } else {
                $div.attr('class','').addClass('explosion')
                    .css('animation-name','explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
            }                        
        },10)
    }

    // Nuke-terine
    
    nuketerine (i,obj,$div) {
        setTimeout(() => {
            $div.show();
            let coords = obj.path(i*this.tScale);
            $div.css('left',`${coords[0]}px`);
            $div.css('top',`${coords[1]}px`);
            if (obj.y<terPoints[Math.round(obj.x)-5]) {
                ++i;   
                this.nuketerine(i,obj,$div); 
            } else {
                $div.attr('class','').addClass('nuke')
                    .css('animation-name','explosion').delay(2000).hide(0);
                    this.bombDamage(obj);
            }
        },10);
    }

    // Called to calculate all projectile damage, a projectile that does 20 damage
    // that lands 10px away will do 10 damage

    bombDamage (obj) {
        let projX = Math.round(obj.x);
        let damage = obj.damage;
        for(let i=0;i<=damage;i++) {
            if ((projX===player1.xPos-i) || (projX===player1.xPos+i)) {
                damage = damage - i;
                player1.health=player1.health-damage;
                $('.health1').text(player1.health)
                if(player1.health<=0) {
                    win('Red')
                }
                return;
            } else if ((projX===player2.xPos-i) || (projX===player2.xPos+i)) {
                damage = damage - i;
                player2.health=player2.health-damage;
                $('.health2').text(player2.health)
                if(player2.health<=0) {
                    win('Blue')
                }
                return;
            }
        }        
    
}
}

// Projectile that keeps track of all positional data

class Projectile {
    constructor(xO,yO,vxO,vyO,damage){
        this.xO = xO;
        this.yO = yO;
        this.vxO = vxO
        this.vx = 0;
        this.vyO = vyO
        this.vy = 0;
        this.x,this.y;
        this.damage = damage;
    }

    // Calculates projectile position and currently velocity based on
    // Newtonian mechanics, takes wind into account

    path(time) {
        this.x = this.xO+this.vxO*time+(.01*wind*time*time);
        this.y = this.yO-this.vyO*time+time*time;
        this.vx = this.vxO +(.02*wind*time)
        this.vy = this.vyO-2*time;
        let coords = [this.x,this.y];
        return coords;
    }
}

// Keystroke definitions

$(document).keydown(function(e){

    // 37 and 39 change the firing angle, updates the stat board, and renders the cannon

    if (e.which == 37) { 
        if (player === true) {
            player1.angle++
            $('.angle1').text(player1.angle)
            $cannon1.css('transform',`rotate(${90-player1.angle}deg)`);
            return false;
        } else {
            player2.angle++
            $('.angle2').text(player2.angle)
            $cannon2.css('transform',`rotate(${90-player2.angle}deg)`);
            return false;
        }
    } else if (e.which == 39) { 
        if (player === true) {
            player1.angle--
            $('.angle1').text(player1.angle)
            $cannon1.css('transform',`rotate(${90-player1.angle}deg)`);
            return false;
        } else {
            player2.angle--
            $('.angle2').text(player2.angle)
            $cannon2.css('transform',`rotate(${90-player2.angle}deg)`);

            return false;
        }

    // 38 and 40 adjust firing power and updates the stat board

    } else if (e.which == 38) {
        if (player === true) {
            player1.power++
            $('.power1').text(player1.power);
            return false;
        } else {
            player2.power++
            $('.power2').text(player2.power);
            return false;
        }
    } else if (e.which == 40) {
        if (player === true) {
            player1.power--
            $('.power1').text(player1.power);
            return false;
        } else {
            player2.power--
            $('.power2').text(player2.power);
            return false;
        }
    }
            
    //    modified fire button for new first method
    else if (e.which == 32) {
        if (player === true) {
            if (player1.ammo[ammoIndex1]<=0) {
                return false;
            }
            
            currentProjectile=player1.ammoSelection(ammoIndex1);
            player1.fire(0,currentProjectile,$projectile,false,ammoIndex1);
            player1.ammo[ammoIndex1]--;
            $('.ammo1').text(`${player1.ammoType[ammoIndex1]}: ${player1.ammo[ammoIndex1]}`)
            player = !player;
            return false;
            
        } else {
            if (player2.ammo[ammoIndex2]<=0) {
                return false;
            }
            currentProjectile=player2.ammoSelection(ammoIndex2)
            player2.fire(0,currentProjectile,$projectile,false,ammoIndex2);
            player2.ammo[ammoIndex2]--;
            $('.ammo2').text(`${player2.ammoType[ammoIndex2]}: ${player2.ammo[ammoIndex2]}`)
            player = !player;
            return false;
            
        }

    // 65 and 68 handles the ammoIndex which is eventually used in the ammoSelection method

    } else if (e.which == 65) { 
        if (player === true) {
            ammoIndex1--;
            if (ammoIndex1 === -1) {
                ammoIndex1 = 4;
            }
            $('.ammo1').text(`${player1.ammoType[ammoIndex1]}: ${player1.ammo[ammoIndex1]}`)
            return false;
        } else {
            ammoIndex2--;
            if (ammoIndex2 === -1) {
                ammoIndex2 = 4;
            }
            $('.ammo2').text(`${player2.ammoType[ammoIndex2]}: ${player2.ammo[ammoIndex2]}`)
            return false;
        }
    } else if (e.which == 68) { 
        if (player === true) {
            ammoIndex1++;
            if (ammoIndex1 === 5) {
                ammoIndex1 = 0;
            }
            $('.ammo1').text(`${player1.ammoType[ammoIndex1]}: ${player1.ammo[ammoIndex1]}`)
            return false;
        } else {
            ammoIndex2++;
            if (ammoIndex2 === 5) {
                ammoIndex2 = 0;
            }
            $('.ammo2').text(`${player2.ammoType[ammoIndex2]}: ${player2.ammo[ammoIndex2]}`)
            return false;
        }
    }

    // specific to the Homing-dew Melon and Grapes of Wrath
    // adjusts boolean values and creates the Grapes of Wrath sub-projectiles
    // based on the currentProjectiles speed and position

     else if (e.which == 67) { 
        midAirBoolean=true;
        }

    // Handles the grease monkey rendering and stat changes

     else if (e.which == 71) { 
        if (player === true) {
            if (player1.monkey >0){
                let $monkey = $('<div>').addClass('monkey').css({'background-image':
                'url(project-imgs/monkey.png)', 'background-size': '100% 100%',
                'top':`${player1.yPos-5}px`,'left':`${player1.xPos-10}px`,
                'animation-name':'monkey'}).delay(2000).hide(0);
                $('.container').append($monkey);
                player1.monkey--;
                player1.health = player1.health+50;
                if (player1.health > 100) {
                    player1.health = 100;
                }
                $('.health1').text(player1.health);
            }
            return false;
        } else {
            if (player2.monkey >0){
                let $monkey = $('<div>').addClass('monkey').css({'background-image':
                'url(project-imgs/monkey.png)', 'background-size': '100% 100%',
                'top':`${player2.yPos-5}px`,'left':`${player2.xPos-10}px`,
                'animation-name':'monkey'}).delay(2000).hide(0)
                $('.container').append($monkey);
                player2.monkey--;
                player2.health = player2.health+50;
                if (player2.health > 100) {
                    player2.health = 100;
                }
                $('.health2').text(player2.health);
            }
            return false;
        }
    }
});

gameStart();

});
