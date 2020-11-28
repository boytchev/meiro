
//	Основи на Компютърната Графика
//	Модел 15181 - Платонови тела
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15181 = function M15181(room, model)
{
	MEIRO.Model.apply(this, arguments);

	this.solid = [];
	this.label = [];
	

	// тетраедър
	this.solid.push( new MEIRO.Graph( 3, 
		[0.5774, -0.2041, 0, -0.2887, -0.2041, -0.5, -0.2887, -0.2041, 0.5, 0, 0.6124, 0],
		[0, 1, 0, 2, 0, 3, 1, 2, 1, 3, 2, 3]
	));
	this.label.push( new MEIRO.Label('Тетраедър',0.5,-1.7,2.2,0) );
	
	// хексаедър (куб)
	this.solid.push( new MEIRO.Graph( 2.1,
		[0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5],
		[0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]
	));
	this.label.push( new MEIRO.Label('Хексаедър (куб)',0.5,-2.5,2.2,0) );

	// октаедър
	this.solid.push( new MEIRO.Graph( 2.6,
		[0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, -0.5, 0, 0.5, 0, 0.7071, 0, 0, -0.7071, 0],
		[5, 0, 5, 1, 5, 2, 5, 3, 4, 0, 4, 1, 4, 2, 4, 3, 0, 1, 1, 2, 2, 3, 3, 0]
	));
	this.label.push( new MEIRO.Label('Октаедър',0.5,-1.7,2.2,0) );

	// додекаедър
	var f = (1+Math.sqrt(5))/2;
	this.solid.push( new MEIRO.Graph( 1.1,
		[ 1,1,1, -1,1,1, 1,-1,1, -1,-1,1, 1,1,-1, -1,1,-1, 1,-1,-1, -1,-1,-1,
		  0,f,1/f, 0,-f,1/f, 0,f,-1/f, 0,-f,-1/f,
		  1/f,0,f, -1/f,0,f, 1/f,0,-f, -1/f,0,-f,
		  f,1/f,0, -f,1/f,0, f,-1/f,0, -f,-1/f,0],
		[0, 8, 0, 12, 0, 16, 1, 8, 1, 13, 1, 17, 2, 9, 2, 12, 2, 18, 3, 9, 3, 13, 3, 19, 4, 10, 4, 14, 4, 16, 5, 10, 5, 15, 5, 17, 6, 11, 6, 14, 6, 18, 7, 11, 7, 15, 7, 19, 8, 10, 9, 11, 12, 13, 14, 15, 16, 18, 17, 19]
	));
	this.label.push( new MEIRO.Label('Додекаедър',0.5,-2,2.2,0) );
	
	// икосаедър
	this.solid.push( new MEIRO.Graph( 2,
		[0, 0.9512, 0, 0.8507, 0.4253, 0, 0.2629, 0.4253, 0.809, -0.6882, 0.4253, 0.5, -0.6882, 0.4253, -0.5, 0.2629, 0.4253, -0.809, 0.6882, -0.4253, 0.5, -0.2626, -0.4253, 0.809, -0.8507, -0.4253, 0, -0.2629, -0.4253, -0.809, 0.6882, -0.4253, -0.5, 0, -0.9512, 0],
		[11, 9, 9, 10, 10, 11, 7, 2, 2, 3, 3, 7, 5, 1, 1, 10, 10, 5, 1, 0, 0, 5, 3, 0, 0, 2, 1, 6, 6, 2, 11, 6, 8, 9, 8, 7, 8, 4, 11, 8, 11, 7, 0, 4, 4, 3, 4, 5, 3, 8, 1, 2, 5, 9, 6, 7, 6, 10, 9, 4]
	));
	this.label.push( new MEIRO.Label('Икосаедър',0.5,-1.8,2.2,0) );
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123n.png');
	this.toggle.stateTexts = ['ТЕТРАЕДЪР','ХЕКСАЕДЪР','ОКТАЕДЪР','ДОДЕКАЕДЪР','ИКОСАЕДЪР'];
	this.toggle.state = -1;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	this.onToggle();
	
	for (var i=0; i<this.solid.length; i++)
	{
		this.solid[i].position.y = -20;
		this.label[i].position.y = 20;
	}
	
	// сглобяване на целия модел
	for (var i=0; i<this.solid.length; i++)
		this.image.add(this.solid[i],this.label[i]);
}

MEIRO.Models.M15181.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M15181.DIST = {MIN:5, MAX:15, HEIGHT:0};
MEIRO.Models.M15181.POS = {DIST:10, ROT_X:-0.9, ROT_Y:0};
MEIRO.Models.M15181.ROT_Y = {MIN:-0.1, MAX:0.1};



// аниматор на модела
MEIRO.Models.M15181.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.solid.length; i++)
	{
		this.label[i].rotateLabel();
			
		this.solid[i].rotation.x = rpm(time,5);
		this.solid[i].rotation.y = rpm(time,6);
		this.solid[i].rotation.z = rpm(time,7);
	}
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M15181.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Платонови тела</h1>';

	s += '<p>Това са правилни многостени oт еднакви правилни многоъгълници, които сключвар еднакви стенни ъгли. Платоновите тела са само 5.</p>';

	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M15181.prototype.onToggle = function(element)
{
	var that = this;
	
	if (this.toggle.state>=0)
	{
		new TWEEN.Tween({y:0,i:this.toggle.state})
			.to({y:20,i:this.toggle.state},1000)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function(){
				that.solid[this.i].position.y = -this.y;
				that.label[this.i].position.y = this.y;
				reanimate();} )
			.start();
	}
	
	this.toggle.state = (this.toggle.state+1)%5;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	
	new TWEEN.Tween({y:40,i:this.toggle.state})
		.to({y:0,i:this.toggle.state},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.solid[this.i].position.y = -this.y;
			that.label[this.i].position.y = this.y;
			reanimate();} )
		.start();
	reanimate();
}
