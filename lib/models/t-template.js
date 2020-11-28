
var SCORE_STATISTICS = !true;
var IN_SCORE_STATISTICS = false;

//	Основи на Компютърната Графика
//	Тест XXX - Xxxx Xx Xxxxxxxxxx
//	П. Бойчев, 2019
//
//	 ├─ T002
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    └─ configureStats
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   │    └─ configure(difficulty)
//	 │   ├─ onDragEnd()
//	 │   ├─ onExitModel()
//	 │   │    ├─ evaluateResult()
//	 │   │    └─ sendResult(callback)
//	 │   ├─ onInfo(element)
//	 └─ 
//
//	Textures
//		
//	Sound effects
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



MEIRO.Models.T002.DIST = {MIN:10, MAX:25, HEIGHT:0};
MEIRO.Models.T002.POS = {DIST:15, ROT_X:0.9, ROT_Y:0.15, ON_FLOOR:true};
MEIRO.Models.T002.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.T002.SCALE = {MAX:0.25};
MEIRO.Models.T002.COMPETENCES = [0,0,0,0,0, 0,0,0,0, 0,0,0, 0,0,0,0,0];



MEIRO.Models.T002.prototype.initialize = function()
{
	if (SCORE_STATISTICS) this.configureStats();
	
	random.randomize();

	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
}

	

MEIRO.Models.T002.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonTimer = new MEIRO.CornerButton('topLeft', function(){that.onExitModel();}, '0:00', 'images/time.png');
	this.buttonTimer.hide();

	this.defaultInfo = '<h1>Les balles rebondissantes (Подскачащите топки)</h1>';
	this.defaultInfo += '<p>???.</p>';
}



MEIRO.Models.T002.prototype.onObject = function()
{
//	if (!this.playing) return undefined;
	
	// координати на мишка
//	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
//	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

//	this.raycaster.setFromCamera( this.mouse, camera );
	
//	var intersects = this.raycaster.intersectObject( this.water );
//	if (intersects.length)
//	{	// при кликване върху водата се маркира, че няма кликване
		// в противен случай може да се кликне на тръба зад водата
//		return undefined;
//	}

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
	
	this.config.score = match*this.config.max_score;

	this.config.time =  Math.floor((animationLoop.time-this.startTime)/1000);
	
//	console.log('score=',this.config.score);
	this.info = '';
	this.info += '<h1 style="text-align:center;">Les balles rebondissantes &ndash; '+Math.round(1000*this.config.score)/10+' от '+Math.round(100*this.config.max_score)+' точки</span></h1>';

//	console.log('evaluation=',this.config.score*match);
}



MEIRO.Models.T002.prototype.sendResult = function(callback)
{
	var competences = [];
	for (var i=0; i<MEIRO.Models.T001.COMPETENCES.length; i++)
		competences.push( Math.round(100*MEIRO.Models.T001.COMPETENCES[i]*this.config.score)/100 );
	
	var data = new FormData();
	data.append('ID', dungeon.id);
	data.append('MODEL', 'T002');
	data.append('DIFFICULTY', this.config.difficulty);
	data.append('MAX_SCORE', this.config.max_score);
	data.append('SCORE', Math.round(100*this.config.score)/100);
	data.append('TIME', this.config.time);
	data.append('CLICKS', this.clicks);
	data.append('COMPETENCES', competences);
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
	//new TWEEN.Tween({k:0})
	//	.to({k:1},500)
	//	.easing( TWEEN.Easing.Quadratic.InOut )
	//	.onUpdate( function(){
	//		// анимация по активиране на модела
	//	} )
	//	.start();
}


// превключвател на модела
MEIRO.Models.T002.prototype.onExitModel = function(element)
{
	//MEIRO.Model.prototype.onExit.call(this);
	
	var that = this;
	
	that.playing = false;
	that.evaluateResult();
	//new TWEEN.Tween({k:1})
	//	.to({k:EPS},500)
	//	.easing( TWEEN.Easing.Quadratic.InOut )
	//	.onUpdate( function(){
	//		// анимация при деактивиране на модела
	//	} )
	//	.start();
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
		
	var max_score = 0;
	
	switch (difficulty)
	{
		// ниска трудност
		case DIFFICULTY_LOW:
			max_score = 0.2;
			break;
			
		// средна трудност
		case DIFFICULTY_MEDIUM:
			max_score = 0.4;
			break;
			
		// висока трудност
		case DIFFICULTY_HIGH:
			max_score = 1.0;
			break;
			
		default: console.error('Unknown difficulty level');
	}

	this.config.max_score = max_score;
}


MEIRO.Models.T002.prototype.postConfigure = function()
{	
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