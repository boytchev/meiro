
//	Основи на Компютърната Графика
//	Модел 12282 - Окръжност в произволна равнина
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12282 = function M12282(room)
{
	MEIRO.Model.apply(this, arguments);
	
	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[0,6],[-6,6]);
	this.basis = new MEIRO.Basis();
	
	// вектори
	this.vectorU = new MEIRO.Vector(this.basis.x,4,'red');
	this.vectorV = new MEIRO.Vector(this.basis.z,4,'red');

	// надписи
	this.labelU = new MEIRO.Label('U',0.3,-0.1,0,0);
	this.labelU.position.copy(this.basis.position(4.3,0,0));
	
	this.labelV = new MEIRO.Label('V',0.3,-0.1,0,0);
	this.labelV.position.copy(this.basis.position(0,0,4.3));
	
	// отсечки
	this.n = 50;
	this.circle = new MEIRO.Polygon(this.n);
	this.circle.material = new THREE.LineBasicMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var a = i/(this.n-1)*2*Math.PI;
		this.circle.setPoint(i,new THREE.Vector3(2+1.8*Math.cos(a),0,2+1.8*Math.sin(a)));
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.oxyz,this.vectorU,this.vectorV,this.labelU,this.labelV,this.circle);
}

MEIRO.Models.M12282.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12282.DIST = {MIN:20, MAX:30, HEIGHT:-3};
MEIRO.Models.M12282.POS = {DIST:20	, ROT_X:1.3, ROT_Y:0.3};
MEIRO.Models.M12282.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M12282.prototype.onAnimate = function(time)
{
	// координатна система
	this.oxyz.rotateLabels();
	
	// надписи
	this.labelU.rotateLabel();
	this.labelV.rotateLabel();

	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M12282.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Окръжност в произволна равнина</h1>';
	
	s += '<p>Два перпендикулярни вектора <em>u</em> и <em>v</em> с една и съща дължина дефинират равнина. Всяка точка <em>P</em> от окръжност в тази равнина с локални полярни координати <em>(r,α)</em> и център с локални декартови координати <em>(x<sub>0</sub>,y<sub>0</sub>)</em> се получава чрез <em>P = (x<sub>0</sub>+r.cosα).u + (y<sub>0</sub>+r.sinα).v</em>.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M12282.prototype.onToggle = function(element)
{
	this.basis.random([-4,4],[1,4],[-4,4]);
	
	// вектори
	this.vectorU.position.copy(this.basis.o);
	this.vectorU.setDirection(this.basis.x);
	
	this.vectorV.position.copy(this.basis.o);
	this.vectorV.setDirection(this.basis.z);
	
	// надписи
	this.labelU.position.copy(this.basis.position(4.3,0,0));
	this.labelV.position.copy(this.basis.position(0,0,4.3));

	// окръжност
	var u = this.basis.x;
	var v = this.basis.z;
	
	var that = this;
	for (var i=0; i<this.n; i++)
	{
		var vert = this.circle.geometry.vertices[i];
		var from = {x:vert.x,y:vert.y,z:vert.z,i:i};
		var a = i/(this.n-1)*2*Math.PI;
		var x = 2+1.8*Math.cos(a);
		var y = 2+1.8*Math.sin(a);
		var p = this.vectorU.position.clone().addScaledVector(u,x).addScaledVector(v,y);
		var to = {x:p.x,y:p.y,z:p.z,i:i};
		new TWEEN.Tween(from)
			.to(to,500)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function(){
							that.circle.geometry.vertices[this.i].set(this.x,this.y,this.z);
							that.circle.geometry.verticesNeedUpdate = true;
						})
			.delay(300*Math.random())
			.start();
	}
	
	reanimate();
}
