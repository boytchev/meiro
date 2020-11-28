
//	Основи на Компютърната Графика
//	Модел 17311 - Алгоритъм на художника
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17311 = function M17311(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 15; // брой триъгълници
	this.pos = 1; // 0=2D, 1=3D
	
	var s = new THREE.Spherical(0,0,0);
	this.triangles = [];
	for (var i=0; i<this.n; i++)
	{
		var geometry = new THREE.Geometry();
		
		for (var j=0; j<3; j++)
		{
			s.radius = THREE.Math.randFloat(2,5);
			s.phi = THREE.Math.randFloat(0,Math.PI);
			s.theta = THREE.Math.randFloat(0,2*Math.PI);
			var v = new THREE.Vector3().setFromSpherical(s);
			v.x *= 0.3;
			v.x += 0.5*i;
			geometry.vertices.push( v );
		}
		
		geometry.faces.push( new THREE.Face3(0,1,2) );
		
		var material = new THREE.MeshBasicMaterial({
			color:new THREE.Color().setHSL(1-i/(this.n-1),1,1/2),
			side:THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetFactor: i/5,
			polygonOffsetUnits: i/5,
		});
		this.triangles.push(new THREE.Mesh(geometry,material));
	}

	this.screen = new MEIRO.Screen(10,10);
	this.screen.position.set(-3.1,0,0);
	this.screen.rotation.y = Math.PI/2;
	this.screen.plate.material = this.screen.plate.material.clone();
	this.screen.plate.material.depthTest = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/start.stop.png');
	this.toggle.hide();
	//this.onToggle();

	// сглобяване на целия модел
	this.image.add(this.screen);
	for (var i=0; i<this.n; i++)
		this.image.add(this.triangles[i]);
}

MEIRO.Models.M17311.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17311.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M17311.POS = {DIST:20, ROT_X:0.571, ROT_Y:0};
MEIRO.Models.M17311.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17311.prototype.onAnimate = function(time)
{
	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M17311.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Алгоритъм на художника</h1>';

	s += '<p>Всички стени се сортират според отдалечеността им от екрана. Рисуват се последователно, като се започва от най-близки и се преминава към по-далечните. Така всяка нарисувана стена закрива каквото е било нарисувано под нея преди нея.</p>';
	s += '<p>Недостатък на този алгоритъм е нуждата от сортиране, което може да се наложи да се прави на всеки кадрър. Освен това не винаги стените могат да бъдат сортирани.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M17311.prototype.onToggle = function(element)
{
	var that = this;
	var s = new THREE.Spherical(0,0,0);
	for (var i=0; i<this.n; i++)
	{
		for (var j=0; j<3; j++)
		{
			var vertex = this.triangles[i].geometry.vertices[j];
			var from = {i:i, j:j, x:vertex.x, y:vertex.y, z:vertex.z, k:this.pos};
			if (this.pos<1)
			{
				s.radius = THREE.Math.randFloat(2,5);
				s.phi = THREE.Math.randFloat(0,Math.PI);
				s.theta = THREE.Math.randFloat(0,2*Math.PI);
				var v = new THREE.Vector3().setFromSpherical(s);
				v.x *= 0.3;
				v.x += 0.5*i;
			}
			else
				var v = vertex;
				
			var to = {i:i, j:j, x:v.x, y:v.y, z:v.z, k:1-this.pos};
			new TWEEN.Tween(from)
				.to(to,500)
				.easing( TWEEN.Easing.Quadratic.InOut )
				.onUpdate( function(){
					that.triangles[this.i].geometry.vertices[this.j].set(this.x*this.k+(1-this.k)*(-3+this.i/100), this.y, this.z);
					that.triangles[this.i].geometry.verticesNeedUpdate = true;
				} )
				.delay( this.pos>0?50*i:50*(this.n-i))
				.start();
				
		}
	}
	
	this.pos = 1-this.pos;
	reanimate();
}
