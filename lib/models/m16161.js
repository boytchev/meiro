
//	Основи на Компютърната Графика
//	Модел 16161 - Битови маски при отсичане на Коен-Съдърленд
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M16161 = function M16161(room)
{
	MEIRO.Model.apply(this, arguments);

	// екран
	this.screen = new MEIRO.Screen(16,10);
	
	// зона
	this.zone = new MEIRO.Cube(1);
	this.zone.material = MEIRO.PRIMITIVE.STYLE.PLATE;
	this.zone.scale.set(6,4,0.1);
	
	// прави
	this.lines = new THREE.Object3D();
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-3,-4.5,0),new THREE.Vector3(-3,4.5,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(3,-4.5,0),new THREE.Vector3(3,4.5,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-7.5,-2,0),new THREE.Vector3(7.5,-2,0)) );
	this.lines.add( new MEIRO.DottedLine(new THREE.Vector3(-7.5,2,0),new THREE.Vector3(7.5,2,0)) );
	
	// битове
	this.bits = [];
	// горна права
	var label = new MEIRO.Label('−−1−',0.4,-0.489,-0.15,0);
	label.position.set(0,2+0.3,0);
	this.bits.push(label);
	var label = new MEIRO.Label('−−0−',0.4,-0.544,-0.15,0);
	label.position.set(0,2-0.3,0);
	this.bits.push(label);
	// долна права
	var label = new MEIRO.Label('−−−1',0.4,-0.489,-0.15,0);
	label.position.set(0,-2-0.3,0);
	this.bits.push(label);
	var label = new MEIRO.Label('−−−0',0.4,-0.544,-0.15,0);
	label.position.set(0,-2+0.3,0);
	this.bits.push(label);
	// лява права
	var label = new MEIRO.Label('−1−−',0.4,-0.489,-0.15,0);
	label.position.set(-3-0.66,1,0);
	this.bits.push(label);
	var label = new MEIRO.Label('−0−−',0.4,-0.544,-0.15,0);
	label.position.set(-3+0.7,1,0);
	this.bits.push(label);
	// дясна права
	var label = new MEIRO.Label('1−−−',0.4,-0.489,-0.15,0);
	label.position.set(3+0.66,-1,0);
	this.bits.push(label);
	var label = new MEIRO.Label('0−−−',0.4,-0.544,-0.15,0);
	label.position.set(3-0.7,-1,0);
	this.bits.push(label);
	
	// маски
	this.masks = [];
	var material = new THREE.MeshLambertMaterial({color:'black'});
	// център
	var label = new MEIRO.Label('0000',1,-1.445,-0.3,0);
	label.position.set(0,0,0);
	this.masks.push(label);
	// горе
	var label = new MEIRO.Label('0010',1,-1.307,-0.3,0);
	label.position.set(0,3.25,0);
	this.masks.push(label);
	// долу
	var label = new MEIRO.Label('0001',1,-1.307,-0.3,0);
	label.position.set(0,-3.25,0);
	this.masks.push(label);
	// ляво
	var label = new MEIRO.Label('0100',1,-1.307,-0.3,0);
	label.position.set(-5.25,0,0);
	this.masks.push(label);
	// дясно
	var label = new MEIRO.Label('1000',1,-1.307,-0.3,0);
	label.position.set(5.25,0,0);
	this.masks.push(label);
	// горе-ляво
	var label = new MEIRO.Label('0110',1,-1.168,-0.3,0);
	label.position.set(-5.25,3.25,0);
	this.masks.push(label);
	// горе-дясно
	var label = new MEIRO.Label('1010',1,-1.168,-0.3,0);
	label.position.set(5.25,3.25,0);
	this.masks.push(label);
	// долу-ляво
	var label = new MEIRO.Label('0101',1,-1.168,-0.3,0);
	label.position.set(-5.25,-3.25,0);
	this.masks.push(label);
	// долу-дясно
	var label = new MEIRO.Label('1001',1,-1.168,-0.3,0);
	label.position.set(5.25,-3.25,0);
	this.masks.push(label);
	
	for (var i=0; i<this.masks.length; i++)
	{
		this.masks[i].material = material;
		this.masks[i].visible = false;
	}
		
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ МАСКИ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.screen,this.zone,this.lines);
	for (var i=0; i<this.bits.length; i++) this.image.add(this.bits[i]);
	for (var i=0; i<this.masks.length; i++) this.image.add(this.masks[i]);
}

MEIRO.Models.M16161.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M16161.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M16161.POS = {DIST:20, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M16161.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M16161.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.bits.length; i++)
		this.bits[i].rotateLabel();
		
	for (var i=0; i<this.masks.length; i++)
		this.masks[i].rotateLabel();
		
//	reanimate();
}



// информатор на модела
MEIRO.Models.M16161.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Битови маски при отсичане на Коен-Съдърленд</h1>';

	s += '<p>Екранът (прозорецът) се отсича с 4 прави. За всяка права се отделя по един бит, като полуравнината в която е екрана (прозореца) е с бит 0, а другата полуравнина &ndash; с бит 1.</p>';
	s += '<p>Четирите прави разделят равнината на 9 зони, като всяка от тях получава уникална битова маска според това в коя полуравнина спрямо всяка права се намира. Зоната на екрана (прозореца) е винаги с нулев код.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M16161.prototype.onToggle = function(element)
{
	for (var i=0; i<this.masks.length; i++)
		this.masks[i].visible = !this.masks[i].visible;
	reanimate();
}