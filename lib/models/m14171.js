
//	Основи на Компютърната Графика
//	Модел 14171 - Ойлерови ъгли
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14171 = function M14171(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// координатни системи
	this.oxyz1 = new MEIRO.Axes3D([-5,5],[-5,5],[-5,5]);
	this.oxyz1.labelO.visible = false;
	this.oxyz1.grid.rotation.x = Math.PI/2;
	this.oxyz1.setLabels("X'","Y'","Z'");
	//this.oxyz1.grid.visible = false;
	var plate = new MEIRO.Cube(1);
	plate.material = new THREE.MeshNormalMaterial({transparent:true,opacity:0.2,depthWrite:false});
	plate.scale.set(10,10,0.08);
	this.oxyz1.add(plate);
	var ball = new THREE.Mesh(
		new THREE.IcosahedronGeometry(2,2),
		new THREE.MeshPhongMaterial({color:'white',shininess:200,shading:THREE.FlatShading})
	);
	this.oxyz1.add(ball);
	
	this.oxyz2 = new MEIRO.Axes3D([-4,4],[-4,4],[-4,4]);
	this.oxyz2.labelO.visible = false;
	this.oxyz2.grid.rotation.x = Math.PI/2;
	this.oxyz2.setColor('cornflowerblue');
	this.oxyz2.setLabels('X"','Y"','Z"');
	this.oxyz2.rotation.set(0.615,0.525,0.615+Math.PI/4,'XYZ');
	//this.oxyz2.grid.visible = false;
	var plate = new MEIRO.Cube(1);
	plate.material = new THREE.MeshNormalMaterial({transparent:true,opacity:0.2,depthWrite:false});
	plate.scale.set(8,8,0.12);
	this.oxyz2.add(plate);
				
	// линия m
	var m = new MEIRO.Line(new THREE.Vector3(5.5,5.5,0),new THREE.Vector3(-5.5,-5.5,0));
	m.material = new THREE.LineBasicMaterial({color:'red'});

	this.labelM = new MEIRO.Label('m',0.3);
	this.labelM.position.set(5,5.5,0);
	
	this.time = -1;
	
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123n.png');
	this.toggle.stateTexts = ['ЪГЪЛ №1 X\'&rarr;m','ЪГЪЛ №2 Z\'&rarr;Z"','ЪГЪЛ №3 X\'&rarr;X"','ОТНАЧАЛО'];
	this.toggle.state = 0;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();

	
	// сглобяване на целия модел
	this.image.add(m,this.oxyz1,this.oxyz2,this.labelM);
}

MEIRO.Models.M14171.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14171.DIST = {MIN:10, MAX:30, HEIGHT:-1};
MEIRO.Models.M14171.POS = {DIST:20, ROT_X:0.9, ROT_Y:0.15};
MEIRO.Models.M14171.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14171.prototype.onAnimate = function(time)
{	
	this.labelM.rotateLabel();
	this.oxyz1.rotateLabels();
	this.oxyz2.rotateLabels();

	TWEEN.update();
	
	if (this.time<0) return;
	
	if (this.time<=1)
	{
		this.oxyz1.rotation.set(0,0,Math.PI/4*this.time,'ZXY');
		return;
	}
	
	if (this.time<=2)
	{
		this.oxyz1.rotation.set(Math.PI/4*(this.time-1),0,Math.PI/4,'ZXY');
		return;
	}
	
	if (this.time<=3)
	{
		this.oxyz1.rotation.set(0.615,0.525,0.615+Math.PI/4*(this.time-2),'XYZ');
		return;
	}

	this.oxyz1.rotation.set(0.615,0.525,0.615+Math.PI/4,'XYZ');
}



// информатор на модела
MEIRO.Models.M14171.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ойлерови ъгли</h1>';

	s += '<p>Ойлеровите ъгли са комплект от три ъгъла, с които се дефинира конкретна ориентация в пространството. Когато комплектът е ZXZ, то съответните ъгли са:</p>';
	s += '<p><ul><li>Ъгъл №1 чрез въртене около <em>Z\'</em>, оста <em>X\'</em> отива от <em>X</em> в <em>m</em></li>';
	s += '<li>Ъгъл №2 чрез въртене около <em>X\'</em>, оста <em>Z\'</em> отива в <em>Z"</em></li>';
	s += '<li>Ъгъл №3 чрез въртене около <em>Z\'</em>, оста <em>X\'</em> отива в <em>X"</em> и оста <em>Y\'</em> отива в <em>Y"</em></li></ul></p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M14171.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%4;
	
	
	var that = this;
	new TWEEN.Tween({k:Math.max(that.time,0)})
		.to({k:that.toggle.state},that.toggle.state==0?2000:5000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.time=this.k; reanimate();} )
		.onComplete( function(){that.toggle.setText(that.toggle.stateTexts[that.toggle.state]);} )
		.start();
		
	reanimate();
}
