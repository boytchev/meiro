
//	Основи на Компютърната Графика
//	Модел 13521 - Поклащане на трева и сила на вятъра
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M13521 = function M13521(room)
{
	MEIRO.Model.apply(this, arguments);

	// вятър
	this.wind = 0;
	
	// трева
	this.curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(0,1/2,0),
		new THREE.Vector3(0,1,0)
	);
	this.n = options.lowpoly?40:1000; // брой тревички
	this.m = options.lowpoly?4:16; // брой възли на една тревичка
	var material = new THREE.LineBasicMaterial({color:'green',transparent:true,opacity:0.5});

	this.root = [];
	this.offset = [];
	for (var i=0; i<this.n; i++)
	{
		var x = 4*THREE.Math.randFloat(-1,1);
		var z = Math.sqrt(16-x*x)*THREE.Math.randFloat(-1,1);
		var p = new THREE.Vector3(x,0,z);
		this.root[i] = p;
		this.offset[i] = new THREE.Vector2(Math.sin(2*p.x),Math.sin(2*p.z));
	}
	
	var geometry = new THREE.Geometry();
	for (var i=0; i<this.n*this.m; i++)
		geometry.vertices.push(new THREE.Vector3());
	this.grass = new THREE.LineSegments(geometry,material);
	
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123.png');
	this.toggle.stateTexts = ['ЛЕК ПОВЕЙ','ВЯТЪР','БУРЯ'];
	this.toggle.state = 0;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.grass);
}

MEIRO.Models.M13521.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M13521.DIST = {MIN:5, MAX:20, HEIGHT:-0.5};
MEIRO.Models.M13521.POS = {DIST:10, ROT_X:0.1, ROT_Y:0.4};
MEIRO.Models.M13521.ROT_Y = {MIN:0, MAX:0.7};


// аниматор на модела
MEIRO.Models.M13521.prototype.onAnimate = function(time)
{
	var t = 0;
	for (var i=0; i<this.n; i++)
	{
		var p = this.root[i];
		var ofsx = (1+this.wind+0.2*Math.sin(time/1000))*Math.sin(p.x/2+p.z/5+rpm(time,11));
		var ofsz = (1+this.wind+0.2*Math.cos(time/1000))*Math.sin(p.x/3-p.z/3+rpm(time,17));
		
		this.curve.v2.x = (0.2+this.wind/5)*Math.sin(rpm(time,5)+ofsx);
		this.curve.v2.z = (0.2+this.wind/5)*Math.sin(rpm(time,9)+ofsz);
		this.curve.v2.normalize();
		
		for (var j=0; j<this.m; j++)
		{
			var u = Math.round(0.25+0.5*j)/(this.m/2-1);
			this.grass.geometry.vertices[t].copy(this.curve.getPoint(u));
			this.grass.geometry.vertices[t].add(this.root[i]);
			t++;
		}
	}
	this.grass.geometry.verticesNeedUpdate = true;
	
	TWEEN.update();
	reanimate();	
}



// информатор на модела
MEIRO.Models.M13521.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Поклащане на трева и сила на вятъра</h1>';

	s += '<p>За симулиране на по-естествено поклащане на трева трябва да се отчита силата на вятъра. Въпрос на лична преценка е да се избере на кои параматри и как ще влияе вятъра.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M13521.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	
	var that = this;
	new TWEEN.Tween({k:that.wind})
		.to({k:that.toggle.state},2000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.wind=this.k} )
		.start();
		
	reanimate();
}