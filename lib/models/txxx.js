
//	Основи на Компютърната Графика
//	Тест XXX - Резултти
//	П. Бойчев, 2019
//
//	 ├─ Txxx
//	 │   ├─ initialize()
//	 │   ├─ construct()
//	 │   │    ├─ constructWheel()
//	 │   │    ├─ constructLabels()
//	 │   │    └─ constructWheelTexture()
//	 │   │          ├─ initWheelTexture()
//	 │   │          └─ drawProfile(profile,color)
//	 │   ├─ onAnimate()
//	 │   ├─ onObject()
//	 │   ├─ onEnter()
//	 │   ├─ onExitModel()
//	 │   ├─ onInfo(element)
//	 └─ 
//
//	Textures
//		
//	Sound effects
//

// конструктор на модела
MEIRO.Models.Txxx = function Txxx(room, model)
{
	MEIRO.Model.apply(this, arguments);
	
	this.initialize();
	this.construct();
}
MEIRO.Models.Txxx.prototype = Object.create(MEIRO.Model.prototype);



MEIRO.Models.Txxx.DIST = {MIN:10, MAX:25, HEIGHT:0};
MEIRO.Models.Txxx.POS = {DIST:15, ROT_X:Math.PI/2, ROT_Y:0, ON_FLOOR:true};
MEIRO.Models.Txxx.ROT_Y = {MIN:0.0, MAX:1.56};
MEIRO.Models.Txxx.SCALE = {MAX:0.25};
MEIRO.Models.Txxx.COMPETENCES = [0,0,0,0,0, 0,0,0,0, 0,0,0, 0,0,0,0,0];



MEIRO.Models.Txxx.prototype.initialize = function()
{
	random.randomize();

	this.WHEEL_RADIUS = 4;
	this.WHEEL_DEPTH = 0.4;
	this.WHEEL_HEIGHT = 4;
	this.WHEEL_GAP = 0.02;
	
	this.LABEL_SIZE = 0.3;

	this.ZONE_RADIUS = 6;
	this.ZONE_WIDTH = 0.1;
	
	this.labels = [];
	
	this.userCompetences = [];
	this.userCompetences[0] = options.urlOptions.tea.split(',');
	this.userCompetences[1] = options.urlOptions.avg.split(',');
	this.userCompetences[2] = options.urlOptions.max.split(',');
	
	for (var i=0; i<17; i++)
		this.userCompetences[0][i] = parseFloat(this.userCompetences[0][i]);
	for (var i=0; i<17; i++)
		this.userCompetences[1][i] = parseFloat(this.userCompetences[1][i]);
	for (var i=0; i<17; i++)
		this.userCompetences[2][i] = parseFloat(this.userCompetences[2][i]);
	
	this.statusTexts = ['Темпорално','Средно','Максимално'];
	
	this.totalCompetences = [3,2,5,5,4, 5,3,5,5, 4,3,2, 5,5,5,5,3];
	this.labelCompoetences = [
		"1.1 Прилагане на математически обекти",
		"1.2. Създаване и използване на уравнения",
		"1.3. Изчисляване на параметри и свойства",
		"1.4. Откриване на математически зависимости",
		"1.5. Апроксимиране на сложни зависимости",
		
		"2.1. Алгоритми за растеризация и обработка на векторни данни",
		"2.2. Представяне, обработване и използване на геометрични данни",
		"2.3. Представяне и обработване на движение",
		"2.4. Представяне и обработване на типове графични обекти",
		
		"3.1. Физични закони и влиянието им върху моделирането на движение",
		"3.2. Симулиране на физични явления",
		"3.3. Математическо и алгоритмично представяне на явления",
		
		"4.1. Работа с цветове и палитри",
		"4.2. Операции с геометрични форми",
		"4.3. Пространствено ориентиране в 2D и 3D",
		"4.4. Темпорално ориентиране и синхронизиране на събития",
		"4.5. Създаване, прилагане и съчетаване на графични ефекти",
	];
	this.competences = {
		T001: [1,0,3,1,3, 0,1,0,0, 0,2,0, 5,0,1,0,3],
		T002: [0,0,2,1,0, 0,0,3,0, 4,3,1, 0,0,3,5,0],
		T003: [2,2,2,5,0, 0,1,0,5, 0,0,1, 1,5,5,0,0],
		T004: [1,1,1,5,1, 0,2,0,5, 0,0,0, 1,5,5,0,0],
		T005: [2,0,0,4,0, 5,0,0,0, 0,0,0, 0,1,3,0,0],
		T006: [3,0,5,4,0, 4,3,0,0, 0,0,0, 0,3,3,0,0],
		T007: [3,0,2,5,0, 0,0,4,0, 2,0,2, 0,5,5,2,0],
		T008: [1,0,5,5,4, 2,0,2,0, 0,0,0, 0,1,5,1,0],
		T009: [0,0,1,2,0, 0,2,5,0, 0,1,2, 1,2,5,0,0],
	};
	
	this.playing = false;
	this.startTime = 0;
	this.lastTime = 0;
	this.clicks = 0;
}

	

MEIRO.Models.Txxx.prototype.construct = function()
{
	// допълнителна светлина, прави пода по-красив
	var light = new THREE.PointLight( 'white', 0.3 );
	light.position.set( 0, 10, 0 );
	this.image.add( light );
	
	this.constructWheel();
	this.initWheelTexture();
	this.drawProfile(this.totalCompetences,'cornflowerblue');
	
	this.drawProfile(this.userCompetences[0],'white');
	this.constructLabels();
	
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();


	// бутон за стартиране/приключване
	var that = this;
	this.buttonExit = new MEIRO.CornerButton('topRight', function(){that.onExitModel();}, 'Назад', 'images/return.back.png');
	this.buttonExit.hide();
	
	this.buttonNext = new MEIRO.CornerButton('topLeft', function(){that.nextMode();}, this.statusTexts[0], 'images/n123.png');
	this.buttonNext.hide();
	this.buttonNext.status = 0;

	this.defaultInfo = '<h1>Резултати</h1>';
	this.defaultInfo += '<p>Обобщените по-долу резултати включват резултатите от всички тестове. Общите точки по критерии ';
	switch (parseInt(options.urlOptions.mode)|0)
	{
		case 0: this.defaultInfo += 'се получават чрез средно темпорално.'; break;
		case 1: this.defaultInfo += 'се получават чрез средно аритметично.'; break;
		default: this.defaultInfo += 'са максимално постигнатите точки.'; break;
	}
	this.defaultInfo += '</p>';
	this.defaultInfo += '<p><table border="1" cellpadding="3" cellspacing="0" style="font-size:90%"><tr><th colspan="2">Точки</th><th>Критерий</th>';
	
	
	for (var i=0; i<17; i++)
	{
		
		var user = this.userCompetences[this.buttonNext.status][i];
		var total = this.totalCompetences[i];
		var percent = 100*user/total;
		
		this.defaultInfo += '<tr><td><b>'+user.toFixed(2)+'</b> от '+total.toFixed(0)+'</td><td>'+percent.toFixed(0)+'%</td><td>'+this.labelCompoetences[i]+'</td></tr>';
	}
	

	this.defaultInfo += '</table></p>';
}



MEIRO.Models.Txxx.prototype.constructWheelTexture = function()
{
	// texture sizes (in pixels)
	this.W = 512;
	this.H = 512;
	
	// create canvas elements with 2D context
	var canvas = document.createElement('canvas');
	canvas.width = this.W;
	canvas.height = this.H;
	this.ctx = canvas.getContext('2d');

	// generate texture
	this.texture = new THREE.Texture(canvas);
	this.texture.repeat = new THREE.Vector2(1,1);
	this.texture.magFilter = THREE.LinearFilter;
	this.texture.mimFilter = THREE.LinearMipMapLinearFilter;
	this.texture.wrapS = THREE.RepeatWrapping;
	this.texture.wrapT = THREE.MirroredRepeatWrapping;
	this.texture.offset = new THREE.Vector2(0,1);
	this.texture.anisotropy = 256; // looks good at oblique angles
	
	return this.texture;
}


MEIRO.Models.Txxx.prototype.nextMode = function()
{
	this.buttonNext.status = (this.buttonNext.status+1)%3;
	this.buttonNext.setText( this.statusTexts[this.buttonNext.status] );

	this.initWheelTexture();
	this.drawProfile(this.totalCompetences,'cornflowerblue');
	
	this.drawProfile(this.userCompetences[this.buttonNext.status],'white');
	reanimate();
}

MEIRO.Models.Txxx.prototype.initWheelTexture = function()
{
	this.ctx.lineWidth = 5;
	var c = this.H/2;
	for (var i=0; i<360; i++)
	{
		var rad = i * (2*Math.PI) / 360;

		var x = c + c*Math.cos(rad);
		var y = c + c*Math.sin(rad);
		var gradient = this.ctx.createLinearGradient(c,c, x, y);
		gradient.addColorStop(0.5, "hsl("+i+", 100%, 150%)");
		gradient.addColorStop(1, "hsl("+i+", 100%, 50%)");
		this.ctx.strokeStyle = gradient;
		
		this.ctx.beginPath();
		this.ctx.moveTo( c, c );
		this.ctx.lineTo( x, y );
		this.ctx.stroke();
	}

	
	this.ctx.shadowColor = 'black';
	this.ctx.shadowBlur = 5;
	this.ctx.strokeStyle = 'black';
	this.ctx.lineWidth = 10;
	this.ctx.beginPath();
	this.ctx.arc(this.H/2,this.H/2,this.H/2,0,2*Math.PI);
	this.ctx.stroke();
	
	this.ctx.lineWidth = 1/2;
	this.ctx.shadowBlur = 0;
	for (var rad = 1; rad<=6; rad++)
	{
		this.ctx.beginPath();
		this.ctx.arc(this.H/2,this.H/2,this.H/2*rad/7,0,2*Math.PI);
		this.ctx.stroke();
	}
	for (var ang = 0; ang<17; ang++)
	{
		var a = (ang)/17*Math.PI*2;
		this.ctx.beginPath();
		this.ctx.moveTo(this.H/2,this.H/2);
		this.ctx.lineTo(this.H/2+this.H/2*Math.cos(a),this.H/2+this.H/2*Math.sin(a));
		this.ctx.stroke();
	}

	this.texture.needsUpdate = true;
}


MEIRO.Models.Txxx.prototype.constructWheel = function()
{
	var textureMap = this.constructWheelTexture();//MEIRO.loadTexture( "textures/xxx_color_wheel.jpg", 1, 1 );
	//var normalMap = MEIRO.loadTexture( "textures/Metal_plate_256x256_normal.jpg", this.FLOOR_SIZE, this.FLOOR_SIZE );
	//var lightMap = MEIRO.loadTexture( "textures/xxx_color_wheel_lightmap.jpg", 1, 1 );

	var geometry = new THREE.RingBufferGeometry(0.001,this.WHEEL_RADIUS,60,20);
	//MEIRO.allowLightmap(geometry);
	
	var pos = geometry.getAttribute('position');
	for (var i=0; i<pos.count; i++)
	{
		var x = pos.getX(i);
		var y = pos.getY(i);
		var z = this.WHEEL_GAP+Math.pow(Math.abs(this.WHEEL_RADIUS*this.WHEEL_RADIUS-x*x-y*y),2)/200;
		pos.setXYZ(i,x,y,z);
	}
	
	var material = new THREE.MeshBasicMaterial( {
			map: textureMap,
			side: THREE.DoubleSide,
	});
	
	var wheel = new THREE.Mesh( geometry, material );
	wheel.position.y = this.WHEEL_HEIGHT;
	this.image.add( wheel );

	var wheel = new THREE.Mesh( geometry, material );
	wheel.scale.z = -1;
	wheel.position.y = this.WHEEL_HEIGHT;
	this.image.add( wheel );
	
	
	// side
	var geometry = new THREE.CylinderBufferGeometry(this.WHEEL_RADIUS,this.WHEEL_RADIUS,2*this.WHEEL_GAP,60,1, true);
	var material = new THREE.MeshBasicMaterial( {
		color:'black',
	} );
	var wheel = new THREE.Mesh( geometry, material );
	wheel.position.y = this.WHEEL_HEIGHT;
	wheel.rotation.x = Math.PI/2;
	this.image.add( wheel );

}	
	
	
	
MEIRO.Models.Txxx.prototype.constructLabels = function()
{
	//var labels = ['M1','M2','M3','M4','M5','C1','C2','C3','C4','P1','P2','P3','A1','A2','A3','A4','A5'];
	var labels = ['1.1','1.2','1.3','1.4','1.5','2.1','2.2','2.3','2.4','3.1','3.2','3.3','4.1','4.2','4.3','4.4','4.5'];
	
	var material = new THREE.MeshStandardMaterial({
		color: 'black',
		metalness: 0.8
	});
	
	for (var i=0; i<labels.length; i++)
	{
		
		var label = new MEIRO.Label(labels[i],this.LABEL_SIZE,0,0,0);
		label.material = material;
		
		this.labels.push( label );
		this.image.add( label );
	}
	
}


MEIRO.Models.Txxx.prototype.drawProfile = function(profile,color)
{
	this.ctx.lineWidth = 3;
	this.ctx.strokeStyle = 'black';
	this.ctx.fillStyle = color;
	this.ctx.shadowColor = 'black';


	this.ctx.beginPath();
	
	for (var i=0; i<17; i++)
	{
		var angle1 = (i-13)/17*Math.PI*2;
		var angle2 = (i+1-13)/17*Math.PI*2;
		var rad = (profile[i]+1)/7 * this.H/2;
		
		this.ctx.arc( this.H/2, this.H/2, rad, angle1, angle2 );
	}
	this.ctx.closePath();

	
	this.ctx.shadowBlur = 0;
	this.ctx.stroke();


	this.ctx.shadowBlur = 0;
	this.ctx.globalAlpha = 0.6;
	this.ctx.fill();
	this.ctx.globalAlpha = 1;
	
}	
	
	
	

MEIRO.Models.Txxx.prototype.onObject = function()
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



MEIRO.Models.Txxx.prototype.onDragEnd = function()
{
}



// аниматор на модела
MEIRO.Models.Txxx.prototype.onAnimate = function(time)
{	
	if (this.playing)
	{
		var turn = controls.rot.x % (2*Math.PI);
		turn = (turn+2*Math.PI) % (2*Math.PI);
		turn = turn>=Math.PI;

		var rad = this.WHEEL_RADIUS+this.LABEL_SIZE/4;

		for (var i=0; i<this.labels.length; i++)
		{
			var label = this.labels[i];
			
			if (turn)
			{
				var angle = (i-11)/this.labels.length * 2*Math.PI + - 0.49 - 0.14;
				label.position.set( rad*Math.cos(angle), this.WHEEL_HEIGHT+rad*Math.sin(angle), 0 );

				label.rotation.y = Math.PI;
				label.rotation.z = -(angle-Math.PI/2+0.05);
			}
			else
			{
				var angle = (i-11)/this.labels.length * 2*Math.PI - 0.49;
				label.position.set( rad*Math.cos(angle), this.WHEEL_HEIGHT+rad*Math.sin(angle), 0 );

				label.rotation.y = 0;
				label.rotation.z = angle-Math.PI/2-0.05;
			}
		}
				
	}

	//TWEEN.update();
	//reanimate();
}



// информатор на модела
MEIRO.Models.Txxx.prototype.onInfo = function(element)
{
	element.innerHTML = this.info;
}



MEIRO.Models.Txxx.prototype.onEnter = function(element)
{
	MEIRO.Model.prototype.onEnter.call(this);

	var that = this;
	
	that.info = that.defaultInfo;

	if (controls.buttonMotion) controls.buttonMotion.hide();
	that.buttonExit.show();
	that.buttonNext.show();
	that.playing = true;
	that.startTime = animationLoop.time;
}


// превключвател на модела
MEIRO.Models.Txxx.prototype.onExitModel = function(element)
{
	window.history.back();
}

