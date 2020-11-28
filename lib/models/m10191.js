
//	Основи на Компютърната Графика
//	Модел 10191 - Ротационни тела
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M10191 = function M10191(room)
{
	MEIRO.Model.apply(this, arguments);

	this.m = options.lowpoly?15:40; // брой върхове по вертикала
	this.n = options.lowpoly?20:60; // брой върхове по напречното сечение

	this.body = new THREE.Mesh(
		new THREE.CylinderGeometry(1,1,1,this.n,this.m,true),
		new THREE.MeshPhongMaterial({color:'white',side:THREE.DoubleSide,vertexColors:THREE.VertexColors})
	);
	this.body.scale.set(10,10,10);
	
	// светлина
	var light1 = new THREE.HemisphereLight('yellow','red',1/4);
	var light2 = new THREE.AmbientLight('white',1/5);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123n.png');
	this.toggle.state = -1;
	this.toggle.hide();
	this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.body,light1,light2);
}

MEIRO.Models.M10191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M10191.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M10191.POS = {DIST:20, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M10191.ROT_Y = {MIN:-0.1, MAX:0.7};


// криви
MEIRO.Models.M10191.prototype.getCurvePoint = function(p)
{
	switch( this.toggle.state>>1 )
	{//					h				r
		case 0: return {h:p,r:0.005*p*p*p-1.5*p*p+1.5*p};
		case 1: return {h:0.5+0.2*Math.cos((p+0.5)*2*Math.PI),r:0.4+0.2*Math.sin((p+0.5)*2*Math.PI)};
		case 2: return {h:p,r:0.2+0.2*Math.sin(Math.PI*p)*Math.sin(3*Math.PI*p)};
		case 3: return {h:0.75+0.08*Math.sin(22*p)-p/4,r:p/2};
		case 4: return {h:1-p,r:0.4*Math.sin(10*p*p)*p};
		case 5: return {h:p,r:THREE.Math.randFloat(0.37,0.4)};
	}
	return {};
}


// повърхнина
MEIRO.Models.M10191.prototype.generateSurface = function()
{
	var g = this.body.geometry;
	var v = g.vertices;
	var idx = 0;
	for (var j=0; j<=this.m; j++)
	{
		var p = j/this.m;
		for (var i=0; i<this.n; i++)
		{
		var pnt = this.getCurvePoint(p);
		var h = pnt.h-0.5;
		var r = Math.abs(pnt.r);
			var a = i/this.n*2*Math.PI;
			v[idx++].set(r*Math.cos(a),h,r*Math.sin(a));
		}
	}

	var color1 = MEIRO.RandomMilkyColor();
	var color2 = color1.clone().offsetHSL(0,-0.2,-0.2);	
	
	var idx = 0;
	for (var j=0; j<this.n; j++)
	{
		for (var i=0; i<2*this.m; i++)
		{
			var choice = this.toggle.state%2 ? (i>>1)%2 : j%2;
			var color = choice?color1:color2;
			var f = g.faces[idx++];
			for (var k=0; k<3; k++)
				f.vertexColors[k] = color;
		}
	}
	
	g.computeVertexNormals();
	g.verticesNeedUpdate = true;
	g.elementsNeedUpdate = true;
}


// аниматор на модела
MEIRO.Models.M10191.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M10191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ротационни тела</h1>';

	s += '<p>Повърхността им се определя от контур, който е завъртян около ос. Ако контурът се представи като начупена линия (верига от отсечки), то всяка отсечка поражда един слой под формата на пресечен конус.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M10191.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%12;
	this.toggle.setText(this.toggle.state%2?'СЛОЕВЕ':'КОНТУРИ');
	this.generateSurface();
	
	reanimate();
}