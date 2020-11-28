
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест 002 - Les balles rebondissantes (Подскачащите топки)
//	П. Бойчев, 2019
//
//	 ├─ T002
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructFloor()
//	 │   │    ├─ constructCover()
//	 │   │    ├─ constructBalls()
//	 │   │    ├─ constructPipes()
//	 │   │    │    └─ constructPipe()
//	 │   │    └─ configureStats()
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   ├─ onDragEnd()
//	 │   ├─ onExitModel()
//	 │   │    ├─ evaluateResult()
//	 │   │    ├─ sendStartup(callback)
//	 │   │    └─ sendResult(callback)
//	 │   ├─ onInfo(element)
//	 └─ 
//
//	Textures
//		
//	Sound effects
//		https://freesound.org/people/zmobie/sounds/319762/
//		https://freesound.org/people/rob3rt/sounds/152613/
//

var DIFFICULTY_LOW = 0;		// ниска трудност
var DIFFICULTY_MEDIUM = 1;	// средна трудност
var DIFFICULTY_HIGH = 2;	// висока трудност

// конструктор на модела
MEIRO.Models.T002 = function T002(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.T002.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.T002.DIST = {MIN:20, MAX:30, HEIGHT:0};
MEIRO.Models.T002.POS = {DIST:30, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T002.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T002.SCALE = {MAX:0.25};
MEIRO.Models.T002.COMPETENCES = [0,0,2,1,0, 0,0,3,0, 4,3,1, 0,0,3,5,0];



MEIRO.Models.T002.prototype.initialize = function()
{
	random.randomize();

	this.COMPARE_HEIGHT = 0;
	this.COMPARE_SIZE = 1;
	this.COMPARE_FREQUENCY = 2;

	this.BASE_RADIUS = 10;
	this.BASE_HEIGHT = 1;
	
	this.BALL_DISTANCE = 3;
	this.BALL_RADIUS = 1;
	this.MAX_BALLS = 6;

	this.JUMP_HEIGHT = 6;
	this.COVER_HEIGHT = 14;
	this.COVER_RADIUS = this.BASE_RADIUS*(1-10/20);
	
	this.PIPE_HEIGHT = 4;
	this.PIPE_RADIUS = 0.7;
	this.PIPE_LENGTH = 1/2;
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
	this.balls = [];
	this.ballsShadows = [];
	this.pipes = [];
	this.pistons = [];
	this.cover = {};
	this.lights = [];
	this.audios = [];

	for (var i=0; i<this.MAX_BALLS; i++)
	{
		this.audios[i] = new Audio('sounds/ball-bounce.mp3');
		this.audios[i].loop = false;
	}

	this.audioPump = new Audio('sounds/air-pump.mp3');
	this.audioPump.volume = 0;
}

	

MEIRO.Models.T002.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.7 );
	light.position.set( 0, 20, 0 );
	this.image.add( light );
	
	this.constructFloor();
	this.constructCover();
	this.constructPipes();
	this.constructBalls();
	this.constructLights();

	
	if (SCORE_STATISTICS) this.configureStats();
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Различната топка</h1>';
	this.defaultInfo += '<p>Няколко топки подскачат, като една от тях се различава от останалите &ndash; по размер, височина на отскока или честотата на топане. Изберете коя е тя като я застопорите с активиране на съответната ѝ въздушна помпа.</p>';
	this.defaultInfo += '<p>Понякога е по-лесно да се сравнят две топки, ако всички останали са временно застопорени.</p>';
}



MEIRO.Models.T002.prototype.constructFloor = function()
{
	var textureMap = MEIRO.loadTexture( "textures/Metal_plate_256x256.jpg", 3*this.BASE_RADIUS, 4 );
	var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", 3*this.FLOOR_RADIUS, 4 );
	//var lightMap = MEIRO.loadTexture( "textures/001_floor_lightmap.jpg", 1, 1 );

	var points = [];
	for (var i=0; i<=10; i++ )
	{
		var x = this.BASE_RADIUS*(1-i/20);
		var y = (this.BASE_HEIGHT+0.2)*Math.pow(i/10,4);
		points.push( new THREE.Vector2(x,y) );
	}
	for (var i=this.COVER_RADIUS; i>=0; i--)
		points.push( new THREE.Vector2(i,this.BASE_HEIGHT) );
		
	var geometry = new THREE.LatheBufferGeometry( points, 60 );
	//MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			metalness: 0.4,
			map: textureMap,
			normalMap: normalMap,
			//lightMap: lightMap,
			//lightMapIntensity: 2,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	var floor = new THREE.Mesh( geometry, material );
	this.image.add( floor );
}	
	
	
	
MEIRO.Models.T002.prototype.constructCover = function()
{
	var textureMap = MEIRO.loadTexture( "textures/metric_glass_1024x512.jpg", 3, 0.95 );
	var alphaMap = MEIRO.loadTexture( "textures/metric_glass_1024x512_alpha.jpg", 3, 0.95 );
	var normalMap = MEIRO.loadTexture( "textures/metric_plate_256x256_normal.jpg", 3, 1 );
	//var lightMap = MEIRO.loadTexture( "textures/001_floor_lightmap.jpg", 1, 1 );

	var points = [];

	var rad = this.COVER_RADIUS;
	
	var x = rad;
	var y = this.BASE_HEIGHT;
	for (var i=0; i<=this.COVER_HEIGHT-this.BASE_RADIUS/2; i+=1/2 )
	{
		points.push( new THREE.Vector2(x,y) );
		y += 1/2;
	}
	for (var i=0; i<=90; i+=7.5)
	{
		var dY = rad*Math.sin(i*Math.PI/180)/2;
		var x = rad*Math.cos(i*Math.PI/180);
		points.push( new THREE.Vector2(x,y+dY) );
	}
	
	var geometry = new THREE.LatheBufferGeometry( points, 60 );
	//MEIRO.allowLightmap(geometry);
	
	var material = new THREE.MeshStandardMaterial( {
			color: 'cornflowerblue',
			metalness: 1,
			//map: textureMap,
			normalMap: normalMap,
			normalScale: new THREE.Vector2(1/2,1/2),
			transparent: true,
			opacity: 0.5,
			alphaMap: alphaMap,
			//emissive: 'navy',
			//emissiveIntensity: 0.2,
			//lightMap: lightMap,
			//lightMapIntensity: 2,
			side: THREE.BackSide,
			polygonOffset: true,
			polygonOffsetUnits: 2,
			polygonOffsetFactor: 2,
	});
	
	// back side of glass cover
	var cover = new THREE.Mesh( geometry, material );
	this.image.add( cover );
	
	// front side of glass cover
	material = material.clone();
	material.side = THREE.FrontSide;
	var cover = new THREE.Mesh( geometry, material );
	this.image.add( cover );
}

	
	
MEIRO.Models.T002.prototype.constructBalls = function()
{
	// balls
	var geometry = new THREE.IcosahedronBufferGeometry( this.BALL_RADIUS, 3 );
	
	for (var i=0; i<this.MAX_BALLS; i++)
	{
		var ball = new THREE.Mesh(
			geometry,
			new THREE.MeshStandardMaterial( {
					color: 'yellow',
					metalness: 0.6,
					emissive: 'red',
					emissiveIntensity: 0.3,
			})
		);
		
		this.image.add( ball );
		this.balls.push( ball );
	}
	
	// shadows of balls
	var alphaMap = MEIRO.loadTexture( "textures/ball_alpha.jpg", 1, 1 );
	var geometry = new THREE.CircleBufferGeometry( this.BALL_RADIUS, 8 );
	
	for (var i=0; i<this.MAX_BALLS; i++)
	{
		var shadow = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial( {
					color: 'black',
					transparent: true,
					opacity: 1,
					alphaMap: alphaMap,
					polygonOffset: true,
					polygonOffsetUnits: -i,
					polygonOffsetFactor: -i,
			})
		);
		shadow.rotation.x = -Math.PI/2;
		shadow.renderOrder = -this.MAX_BALLS+i;
		
		this.image.add( shadow );
		this.ballsShadows.push( shadow );
	}
	
}

	
	
MEIRO.Models.T002.prototype.constructLights = function()
{
	// lights
	for (var i=0; i<this.MAX_BALLS; i++)
	{
		var light = new THREE.PointLight('red',1,1);
		this.image.add( light );
		this.lights.push( light );
	}
}



MEIRO.Models.T002.prototype.constructPipes = function()
{
	for (var i=0; i<this.MAX_BALLS; i++)
	{
		var pipe = this.constructPipe();
		this.pipes.push( pipe );
		this.image.add( pipe );
	}
}



MEIRO.Models.T002.prototype.constructPipe = function()
{
	var pipe = new THREE.Group();
	pipe.position.y = this.PIPE_HEIGHT;
	
	// tube
	//var normalMap = MEIRO.loadTexture( "textures/metric_plate_256x256_normal.jpg", 1, 1/2 );
	var textureMap = MEIRO.loadTexture( "textures/002_stripes.jpg", 1, 1 );
	var geometry = new THREE.CylinderBufferGeometry( this.PIPE_RADIUS, this.PIPE_RADIUS, this.PIPE_LENGTH, 32, 1, true );
	
	var tube = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				//color: 'lightgray',
				map: textureMap,
				metalness: 0.1,
				emissive: 'cyan',
				emissiveIntensity: 0,
				//normalMap: normalMap,
				//normalScale: new THREE.Vector2(1/2,1/2),
		})
	);
	tube.position.x = this.COVER_RADIUS+this.PIPE_LENGTH/2;
	tube.rotation.z = -Math.PI/2;
	pipe.add( tube );
	
	// connector
	var geometry = new THREE.CylinderBufferGeometry( 1.2*this.PIPE_RADIUS, 1.2*this.PIPE_RADIUS, 0.2*this.PIPE_LENGTH, 32, 1 );
	var connector = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial( {
				color: 'black',
		})
	);
	connector.position.x = this.COVER_RADIUS;
	connector.rotation.z = -Math.PI/2;
	pipe.add( connector );


	// sucktion
	var textureMap = MEIRO.loadTexture( "textures/002_sucktion.jpg", 1, 1 );
	var geometry = new THREE.CircleBufferGeometry( this.PIPE_RADIUS, 16 );
	var sucktion = new THREE.Mesh(
		geometry,
		new THREE.MeshBasicMaterial( {
				color: 'white',
				map: textureMap,
				polygonOffset: true,
				polygonOffsetUnits: -1,
				polygonOffsetFactor: -1,
		})
	);
		
	sucktion.rotation.y = -Math.PI/2;
	sucktion.rotation.z = 2*Math.PI*Math.random();
	sucktion.position.x = this.COVER_RADIUS-0.1*this.PIPE_LENGTH;
	pipe.add( sucktion );
	pipe.sucktion = sucktion;
	
	// cap
	var textureMap = MEIRO.loadTexture( "textures/002_stripes.jpg", 1, 2 );
	var geometry = new THREE.SphereBufferGeometry( this.PIPE_RADIUS, 32, 8, 0, 2*Math.PI, 0, Math.PI/2 );
	var cap = new THREE.Mesh(
		geometry,
		new THREE.MeshStandardMaterial( {
				//color: 'lightgray',
				map: textureMap,
				metalness: 0.1,
				emissive: 'cyan',
				emissiveIntensity: 0,
				//normalMap: normalMap,
				//normalScale: new THREE.Vector2(1/2,1/2),
		})
	);
	cap.scale.y = 1;
	cap.position.x = this.COVER_RADIUS+this.PIPE_LENGTH;
	cap.rotation.z = -Math.PI/2;
	pipe.add( cap );
	pipe.cap = cap;
	pipe.tube = tube;
	pipe.expanding = false;
	
	return pipe;
}



MEIRO.Models.T002.prototype.onObject = function()
{
	if (!this.playing) return undefined;
	
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	
/*	
	var intersects = this.raycaster.intersectObject( this.cover );
	if (intersects.length)
	{	// при кликване върху похлупака се маркира, че няма кликване
		// в противен случай може да се кликне на помпа зад похлупака
		console.log('glass');
		return undefined;
	}
*/
	

	for( var i=0; i<this.config.balls; i++)
	{
		var pipe = this.pipes[i];
		for(var j=0; j<pipe.children.length; j++)
		{
			var element = pipe.children[j];
			var intersects = this.raycaster.intersectObject( element );
			if (intersects.length)
			{
				this.clicks++;
				//console.log('on '+i);
				pipe.expanding = !pipe.expanding;
				this.audioPump.volume = 1;
				this.audioPump.play();
				return pipe;
			}
		}
	}

	return undefined;
}



MEIRO.Models.T002.prototype.onDragEnd = function()
{
}



// аниматор на модела
MEIRO.Models.T002.prototype.onAnimate = function(time)
{	
	if (this.playing)
	{
		if (time-this.lastTime>=1000)
		{
			var dTime =  Math.floor((time-this.startTime)/1000);
			var s = dTime%60;
			var m = Math.floor(dTime/60)%60;
			var h = Math.floor(dTime/60/60);
			var string = (m<10?0:'')+m+':'+(s<10?0:'')+s;
			if (h) string = h+':'+string;
			this.buttonTimer.setText(string);
			this.lastTime = time;
		}
	}

	// manage balls and pipes
	for (var i=0; i<this.config.balls; i++)
	{
		var ball = this.balls[i];
		var shadow = this.ballsShadows[i];
		var pipe = this.pipes[i];
		var light = this.lights[i];
		
		// вертикална позиция на топката
		
		var newSine = Math.sin(rpm(time,ball.jumpSpeed) + ball.jumpOffset);
		if (pipe.cap.scale.y<0.8)
			if (Math.sign(newSine)!=Math.sign(ball.oldSine))
				if (this.audios[i].readyState>=4)
				{
					this.audios[i].play();
				}
		var jump = Math.abs(newSine);
		ball.oldSine = newSine;
		ball.position.y = this.BASE_HEIGHT + ball.jumpHeight*jump;

		c = 1.5*ball.scale.x;
		shadow.scale.set(c,c,c);
		shadow.material.opacity = 1-2*jump;
		
		var k = 0.98;
		var targetScale = pipe.expanding?1:0.3;
		var blink = THREE.Math.clamp(0.5+1.5*Math.sin(rpm(time,80)),0,2)/5;
		pipe.cap.scale.y = pipe.cap.scale.y*k+(1-k)*targetScale;
		pipe.tube.material.emissiveIntensity = pipe.expanding?-blink:0;
		pipe.cap.material.emissiveIntensity = pipe.expanding?-blink:0;
		light.intensity = pipe.expanding?blink/2:0;

		// ball sucktion
		var targetY = this.PIPE_HEIGHT+Math.sin(rpm(time+i,250))/20;
		var k = (pipe.cap.scale.y-0.3)/0.7; // from [0.3,1] to [0,1]
		ball.position.y = ball.position.y*(1-k)+k*targetY;
		shadow.material.opacity = shadow.material.opacity*(1-k)+k*0.2;
		
		// ball compression
		if (ball.position.y<this.BASE_HEIGHT+this.BALL_RADIUS*ball.jumpSize)
		{
			// смачкване на топката
			ball.scale.y = (2*this.BALL_RADIUS*ball.jumpSize - (this.BASE_HEIGHT+this.BALL_RADIUS*ball.jumpSize - ball.position.y)) / (2*this.BALL_RADIUS*ball.jumpSize);
			
			ball.scale.x = (2-ball.scale.y)*ball.jumpSize;
			ball.scale.z = ball.scale.x;
			
			ball.position.y = this.BASE_HEIGHT + this.BALL_RADIUS*ball.jumpSize*ball.scale.y;
		}
		else
		{
			ball.scale.set( ball.jumpSize, ball.jumpSize, ball.jumpSize );
		}
		
	}
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.T002.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.T002.prototype.evaluateResult = function()
{	
	var match = 0;
	var correct = 0;
	var wrong = 0;
	for (var i=0; i<this.config.balls; i++)
		if (this.pipes[i].expanding)
		{
			if (this.balls[i].different)
				correct++;
			else
				wrong++;
		}
	match = THREE.Math.clamp(correct-0.7*wrong,0,1);
	
	//for (var i=0; i<this.config.balls; i++)
	//	console.log(i,this.balls[i].different,this.pipes[i].expanding);
	//console.log('match=',match);
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Различната топка &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';
	switch (this.config.compare)
	{
		case this.COMPARE_HEIGHT:
			this.info += '<p>Различната топка се топаше с различна височина спрямо останалите.';
			break;
			
		case this.COMPARE_SIZE:
			this.info += '<p>Различната топка имаше различен размер спрямо останалите.';
			break;
			
		case this.COMPARE_FREQUENCY:
			this.info += '<p>Различната топка се топаше с различна честота спрямо останалите.';
			break;
	}
	
	if (!correct && !wrong)
		this.info += ' За съжаление няма избрана нито една топка.';
	
	if (correct && !wrong)
		this.info += ' Избрана е точно правилната топка.';
	
	if (correct && wrong)
		this.info += ' Една от избраните топки е правилната.';
	
	this.info += '</p>';
	
	
//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T002.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T002.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T002.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ACTION', 'END');
	data.append('MODEL', 'T002');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
	postData(data,callback,callback);
}



MEIRO.Models.T002.prototype.sendStartup = function(callback)
{
	var data = new FormData();
	data.append('ACTION', 'START');
	data.append('MODEL', 'T002');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	postData(data,callback,callback);
}



MEIRO.Models.T002.prototype.onEnter = function(element)
{
	MEIRO.Model.prototype.onEnter.call(this);

	var that = this;
	
	that.info = that.defaultInfo;

	if (controls.buttonMotion) controls.buttonMotion.hide();
	that.buttonTimer.setText('');
	that.buttonTimer.show();
	that.playing = true;
	that.configure(parseInt(options.difficulty)|0);
	that.startTime = animationLoop.time;
//	new TWEEN.Tween({k:0})
//		.to({k:1},500)
//		.easing( TWEEN.Easing.Quadratic.InOut )
//		.onUpdate( function(){
//			// анимация по активиране на модела
//		} )
//		.start();
}


// превключвател на модела
MEIRO.Models.T002.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();
//	new TWEEN.Tween({k:1})
//		.to({k:EPS},500)
//		.easing( TWEEN.Easing.Quadratic.InOut )
//		.onUpdate( function(){
//			// анимация при деактивиране на модела
//		} )
//		.start();
	that.sendResult(
	function(){
		MEIRO.showInfo(this,
				function(){
//					console.log('on before close info');
					if (MEIRO.singleRoom)
					{	
						window.history.back();
					}
				},
				function(){
//					console.log('on after close info');
					if (!MEIRO.singleRoom)
					{
						if (controls.buttonMotion) controls.buttonMotion.show();
						controls.startWalk(true,false);
					}
					that.info = that.defaultInfo;
				}
		);
	}
	);
	
	reanimate();
}



// конфигурира сцената според желаната трудност
MEIRO.Models.T002.prototype.configure = function(difficulty)
{	
	this.config = {difficulty: difficulty};
	this.config.compare = random(this.COMPARE_HEIGHT,this.COMPARE_FREQUENCY);
//console.log(this.COMPARE_HEIGHT,this.COMPARE_FREQUENCY,this.config.compare);
	
	var max_score = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			this.config.balls = 3;
			max_score = 0.2;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			this.config.balls = 4;
			max_score = 0.4;
			break;
				
		// висока трудност
		case DIFFICULTY_HIGH:
			if (random(0,1))
			{
				this.config.balls = 5;
				max_score = 0.8;
				break;
			}
			{
				this.config.balls = 6;
				max_score = 1.0;
			}
			break;
			
		default: console.error('Unknown difficulty level');
	}

	for (var i=0; i<this.MAX_BALLS; i++)
	{
		var ball = this.balls[i];
		var shadow = this.ballsShadows[i];
		var pipe = this.pipes[i];
		var light = this.lights[i];
		
		// позиция
		var a = i/this.config.balls*2*Math.PI;
		var r = this.BALL_DISTANCE;
		ball.position.set( r*Math.cos(a), 0, r*Math.sin(a) );
		shadow.position.set( r*Math.cos(a), this.BASE_HEIGHT, r*Math.sin(a) );
		pipe.rotation.y = -a;
		var r = this.COVER_RADIUS+this.PIPE_LENGTH;
		light.position.set( r*Math.cos(a), this.PIPE_HEIGHT/2, r*Math.sin(a) );
		
		// видимост
		ball.visible = i<this.config.balls;
		shadow.visible = ball.visible;
		pipe.visible = ball.visible;
		light.visible = ball.visible;
		
		// параметри
		ball.jumpOffset = Math.random()*2*Math.PI;
		ball.jumpHeight = this.JUMP_HEIGHT;
		ball.jumpSpeed = 10;
		ball.jumpSize = 1;
		ball.oldSine = 0;
		ball.different = false;

		pipe.expanding = !true;
	}

	
	var i = random(0,this.config.balls-1);
	var ball = this.balls[i];
	ball.different = true;
	switch (this.config.compare)
	{
		case this.COMPARE_HEIGHT:
			var percents = [0.50, 0.60, 0.70, 0.80, 1.20, 1.30, 1.40, 1.50];
			var scores =   [0.10, 0.06, 0.03, 0.00, 0.00, 0.03, 0.06, 0.10];
			var i = random(0,percents.length-1);

			ball.jumpHeight *= percents[i];
			max_score -= scores[i];
			break;
			
		case this.COMPARE_SIZE:
			var percents = [0.50, 0.60, 0.70, 0.80, 1.20, 1.30, 1.40, 1.50];
			var scores =   [0.10, 0.06, 0.03, 0.00, 0.00, 0.03, 0.06, 0.10];
			var i = random(0,percents.length-1);
			
			ball.jumpSize *= percents[i];
			max_score -= scores[i];
			break;
			
		case this.COMPARE_FREQUENCY:
			var percents = [0.50, 0.60, 0.70, 0.80, 1.20, 1.30, 1.40, 1.50];
			var scores =   [0.10, 0.06, 0.03, 0.00, 0.00, 0.03, 0.06, 0.10];
			var i = random(0,percents.length-1);
			
			ball.jumpSpeed *= percents[i];
			max_score -= scores[i];
			break;
	}
//	console.log('score',max_score);
//	for (var i=0; i<this.MAX_BALLS; i++)
//		console.log(i,this.balls[i].visible,this.balls[i].jumpHeight,this.balls[i].jumpSize,this.balls[i].jumpSpeed);
	this.config.max_score = max_score;
	
	if (!IN_SCORE_STATISTICS)
	{
		this.sendStartup();
	}
}


// извежда статистика за шъзмовните конфигурации
MEIRO.Models.T002.prototype.configureStats = function()
{	
	IN_SCORE_STATISTICS = true;

	var data = [];
	var that = this;
	
	var NUMBER_OF_TESTS = 100000;
	
	function calculateStats(difficulty,name)
	{
		var min=1000;
		var max=0;
		var avg = 0;
		for(var i=0; i<NUMBER_OF_TESTS; i++)
		{
			that.configure(difficulty);
			var k = Math.round(that.config.max_score*1000);
			min = Math.min(k,min);
			max = Math.max(k,max);
			avg += k;
		}
		data.push({level:name, min:min, avg:Math.floor(10*avg/NUMBER_OF_TESTS)/10, max:max});
	}
	
	console.log('\n\n\nSCORE AND DIFFICULTY STATISTICS\nVALUE RANGE: 0..1000\nTESTS COUNT: '+NUMBER_OF_TESTS);
	calculateStats(DIFFICULTY_LOW,'LOW');
	calculateStats(DIFFICULTY_MEDIUM,'MEDIUM');
	calculateStats(DIFFICULTY_HIGH,'HIGH');
	
	console.table( data );
	
	IN_SCORE_STATISTICS = false;
}