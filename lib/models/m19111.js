
//	Основи на Компютърната Графика
//	Модел 19111 - Видове геометрии
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M19111 = function M19111(room)
{
	MEIRO.Model.apply(this, arguments);


	// плочка
	this.points = [
		[ new THREE.Vector4 (3,3,0,1), new THREE.Vector4 (0,3,0,1), new THREE.Vector4 (-3,3,0,1) ],
		[ new THREE.Vector4 (3,0,0,1), new THREE.Vector4 (0,0,0,1), new THREE.Vector4 (-3,0,0,1) ],
		[ new THREE.Vector4 (3,-3,0,1), new THREE.Vector4 (0,-3,0,1), new THREE.Vector4 (-3,-3,0,1) ]
	];
	this.knots = [0, 0, 0, 1, 1, 1];
	this.surface = new THREE.NURBSSurface(2,2,this.knots,this.knots,this.points);

	var map = new THREE.TextureLoader().load( 'data:image/png;base64,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' );
	map.anisotropy = 16;
	
	var that = this;
	function getSurfacePoint(u, v)
	{
		return that.surface.getPoint(u, v);
	}

	var geometry = new THREE.ParametricBufferGeometry( getSurfacePoint, 20, 20 );
	var material = new THREE.MeshBasicMaterial( {map:map, side:THREE.DoubleSide} );
	this.object = new THREE.Mesh( geometry, material );
	
	// бутон за превключване
	var that = this;
	this.labels = ['КОНГРУЕНТНА','КОНФОРМАЛНА','АФИННА','ПРОЕКТИВНА','ТОПОЛОГИЧНА'];
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, this.labels[0], 'images/n123n.png');
	this.toggle.state = 0;
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.object);
}

MEIRO.Models.M19111.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M19111.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M19111.POS = {DIST:10, ROT_X:1.57, ROT_Y:0};
MEIRO.Models.M19111.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M19111.prototype.onAnimate = function(time)
{
	function S(n) { return Math.sin(rpm(time,n)); }
	function C(n) { return Math.cos(rpm(time,n)); }
	
	var h,v,s,c,m;
	switch (this.toggle.state)
	{
		case 0: h = {x:1,y:0}; v = {x:0,y:1}; s = 2; c = s; m = 0; break;
		case 1: h = {x:1,y:0}; v = {x:0,y:1}; s = 1.5+1*S(30); c = s; m = 0; break;
		case 2:
			var a = S(21)/2; h = {x:Math.cos(a),y:Math.sin(a)};
			a = Math.PI/2+C(17)/2; v = {x:Math.cos(a),y:Math.sin(a)}; 
			s = 1.5+1*S(30);
			c = 1.5+1*C(26);
			m = 0;
			break;
		case 3: h = {x:1,y:0}; v = {x:0,y:1}; s = 1.5; c = s; m = 0.6; break;
		case 4: h = {x:1,y:0}; v = {x:0,y:1}; s = 1.5; c = s; m = 1; break;
	}
	
	this.points[0][0].set(h.x+v.x+m*S(12),h.y+v.y+m*C(11),0,1);
	this.points[0][2].set(-h.x+v.x+m*C(13),-h.y+v.y+m*S(10),0,1);
	this.points[2][0].set(h.x-v.x+m*S(14),h.y-v.y+m*C(11),0,1);
	this.points[2][2].set(-h.x-v.x+m*C(10),-h.y-v.y+m*S(13),0,1);
	if (this.toggle.state!=3)
	{
		this.points[0][1].set(v.x+m*S(10),v.y+m*C(15),0,1);
		this.points[1][0].set(h.x+m*S(12),h.y+m*C(13),0,1);
		this.points[1][1].set(0+m*C(11),0+m*S(14),0,1);
		this.points[1][2].set(-h.x+m*S(10),-h.y+m*C(14),0,1);
		this.points[2][1].set(-v.x+m*C(14),-v.y+m*S(11),0,1);
	}
	else
	{
		this.points[0][1].lerpVectors(this.points[0][0],this.points[0][2],0.5);
		this.points[2][1].lerpVectors(this.points[2][0],this.points[2][2],0.5);
		this.points[1][0].lerpVectors(this.points[0][0],this.points[2][0],0.5);
		this.points[1][2].lerpVectors(this.points[0][2],this.points[2][2],0.5);
		this.points[1][1].lerpVectors(this.points[1][0],this.points[1][2],0.5);
	}
	
	this.surface = new THREE.NURBSSurface(2,2,this.knots,this.knots,this.points);
	var that = this;
	function getSurfacePoint(u, v)
	{
		return that.surface.getPoint(u, v);
	}
	this.object.geometry = new THREE.ParametricBufferGeometry( getSurfacePoint, this.toggle.state>2?20:2, this.toggle.state>2?20:2 );
	
	this.object.position.set(3*Math.sin(rpm(time,5)),1*Math.cos(rpm(time,7)),0);
	this.object.rotation.z = rpm(time,5);
	this.object.scale.set(s,c,s);

	reanimate();
}



// информатор на модела
MEIRO.Models.M19111.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Видове геометрии</h1>';

	s += '<p>В компютърната графика се използват различни видове геометрии, избрани според стойствата на обектите или техните движения:</p>';
	s += '<ul>';
	s += '<li><em>конгруентна</em> &ndash; запазва размери, пропорции, ъгли, успоредност, правост и съседност; губи положение и ориентация;</li>';
	s += '<li><em>конформална</em> &ndash; запазва пропорции, ъгли, успоредност, правост и съседност;</li>';
	s += '<li><em>афинна</em> &ndash; запазва успоредност, правост и съседност;</li>';
	s += '<li><em>проективна</em> &ndash; запазва правост и съседност;</li>';
	s += '<li><em>топологична</em> &ndash; запазва съседност;</li>';
	s += '</ul>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M19111.prototype.onToggle = function(element)
{	
	this.toggle.state = (this.toggle.state+1)%5;
	this.toggle.setText(this.labels[this.toggle.state]);
	reanimate();
}
	