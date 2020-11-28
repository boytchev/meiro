
//	Основи на Компютърната Графика
//	Модел 04391 - Скаларно произведение на вектори
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M04391 = function M04391(room)
{
	MEIRO.Model.apply(this, arguments);
	
	// координатна система
	this.oxyz = new MEIRO.Axes3D([-6,6],[0,6],[-6,6]);
	this.basis = new MEIRO.Basis();
	this.plateBasis = new MEIRO.Basis();
	
	// вектори
	this.vectorU = new MEIRO.Vector(this.basis.x,3,'red');
	this.vectorV = new MEIRO.Vector(this.basis.z,3,'red');

	// пунктири
	this.lineVert = new MEIRO.DottedLine();
	this.lineVertU = new MEIRO.DottedLine();
	this.lineVertV = new MEIRO.DottedLine();
	this.lineU = new MEIRO.DottedLine();
	this.lineV = new MEIRO.DottedLine();
	
	// ъгломер
	this.plate = new MEIRO.Cube(1);
	this.plate.geometry = this.plate.geometry.clone();
	this.plate.geometry.scale(2,0.1,2);
	this.plate.geometry.translate(1,0,1);
	this.plate.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.plate.material.opacity = 0.2;
	this.plate.matrixAutoUpdate = false;
	
	// надписи
	this.labelU = new MEIRO.Label('U',0.3,-0.1,0,0);
	this.labelV = new MEIRO.Label('V',0.3,-0.1,0,0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ОТНОВО', 'images/random.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.oxyz,this.vectorU,this.vectorV,this.plate,this.labelU,this.labelV,this.lineVert,this.lineVertU,this.lineVertV,this.lineU,this.lineV);
}

MEIRO.Models.M04391.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M04391.DIST = {MIN:10, MAX:30, HEIGHT:-1};
MEIRO.Models.M04391.POS = {DIST:20, ROT_X:1.3, ROT_Y:0.3};
MEIRO.Models.M04391.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M04391.prototype.onAnimate = function(time)
{
	// координатна система
	this.oxyz.rotateLabels();
	
	// вектори
	this.vectorU.position.copy(this.basis.o);
	this.vectorU.setDirection(this.basis.x);
	
	this.vectorV.position.copy(this.basis.o);
	this.vectorV.setDirection(this.basis.z);
	
	// пунктири
	this.lineVert.setFromToXZ(this.basis.o);
	this.lineVertU.setFromToXZ(this.basis.position(3,0,0));
	this.lineVertV.setFromToXZ(this.basis.position(0,0,3));
	
	this.lineU.setFromTo(this.lineVert.getTo(),this.lineVertU.getTo());
	this.lineV.setFromTo(this.lineVert.getTo(),this.lineVertV.getTo());

	// ъгломер
	
	// надписи
	this.labelU.rotateLabel();
	this.labelU.position.copy(this.basis.position(3.2,0,0));
	
	this.labelV.rotateLabel();
	this.labelV.position.copy(this.basis.position(0,0,3.2));

	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M04391.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Скаларно произведение на вектори</h1>';
	
	s += '<p>Използва се за определяне на перпендикулярност на два вектора. Ако скаларното произведение <em>u.v=0</em>, то векторите <em>u</em> и <em>v</em> са перпендикулярни.</p>';

	s += '<p>При настоящия избор на вектори имаме:</p>';
	var u = this.basis.x.clone().multiplyScalar(3);
	var v = this.basis.z.clone().multiplyScalar(3);
	s += '<p style="padding-left:2em"><em>u ≈ ('+u.x.toFixed(2)+', '+u.y.toFixed(2)+', '+u.z.toFixed(2)+')</em><br>';
	s += '<em>v ≈ ('+v.x.toFixed(2)+', '+v.y.toFixed(2)+', '+v.z.toFixed(2)+')</em><br>';
	var r = u.dot(v);
	s += '<em>u.v ≈ '+r.toFixed(4)+'</em></p>';
	
	s += '<p>Освен за определяне на перпендикулярност, скаларното произведение се използва за намиране степента на осветеност на повърхност и разграничаване на обърнати към нас стени спрямо обърнати в обратна посока.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M04391.prototype.onToggle = function(element)
{
	this.basis.random([-4,4],[1,4],[-4,4]);
	var that = this;
	new TWEEN.Tween({k:0})
		.to({k:1},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
						that.plateBasis.lerp(that.basis,this.k);
						that.plateBasis.apply(that.plate);
					})
		.start();
	reanimate();
}
