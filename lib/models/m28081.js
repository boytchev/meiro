
//	Основи на Компютърната Графика
//	Модел 28081 - Осветяване на мистериозен обект
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28081 = function M28081(room)
{
	MEIRO.Model.apply(this, arguments);

	this.material = new THREE.MeshPhongMaterial({color:'white',side:THREE.DoubleSide});
	
	this.k = 0;
	this.ball = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, this.material);
	
	this.prop = new THREE.Object3D();
	for (var i=0; i<5; i++)
	{
		var p = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, this.material );
		p.scale.set(0.25,2,0.5);
		p.rotation.z = i/5*Math.PI;
		this.prop.add( p );
	}
	
	this.frame = new THREE.Mesh( new THREE.TorusGeometry(2,0.1,12,48), this.material );
	this.frame.position.z = 0.4;
	this.frame1 = new THREE.Mesh( this.frame.geometry, this.material );
	this.frame1.position.z = -0.4;
	this.frame2 = new THREE.Mesh( new THREE.CylinderGeometry(2.1,2.1,0.8,48,1,true), this.material );
	this.frame2.rotation.x = Math.PI/2;
	
	this.frameA = new THREE.Mesh( new THREE.CylinderGeometry(2,0.8,0.6,48,1,true), this.material );
	this.frameA.position.z = -0.1;
	this.frameA.rotation.x = Math.PI/2;
	
	this.frameB = new THREE.Mesh( new THREE.CylinderGeometry(0.8,2,0.6,48,1,true), this.material );
	this.frameB.position.z = 0.1;
	this.frameB.rotation.x = Math.PI/2;

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Покажи', 'images/show.hide.png');
	this.toggle.hide();
	
	this.defaultLight.intensity = this.k;
	this.ambient = new THREE.AmbientLight('cornflowerblue',1-this.k);
	
	// сглобяване на целия модел
	this.image.add(this.ball,this.prop,this.frame,this.frame1,this.frame2,this.frameA,this.frameB,this.ambient);
}

MEIRO.Models.M28081.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28081.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M28081.POS = {DIST:10, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M28081.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28081.prototype.onAnimate = function(time)
{
	this.prop.rotation.z = rpm(time,20);
	
	TWEEN.update();
	if (this.k) reanimate();
}



// информатор на модела
MEIRO.Models.M28081.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Осветяване на мистериозен обект</h1>';

	s += '<p>Този модел демонстрира как осветяването може да е съществено за възприемане на формата на обект. Това важи за всички форми, които е трудно да се разпознаят по профила им, или пък са "втъкнати" в други форми.</p>';
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M28081.prototype.onToggle = function(element)
{
	var that = this;
	
	new TWEEN.Tween({k:that.k})
		.to({k:that.k>0.5?0:1},2000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.k = this.k;
			that.defaultLight.intensity = this.k;
			that.ambient.intensity = 1-this.k;
			that.material.color.setRGB( 1-this.k*(0xff-0x64)/255,1-this.k*(0xff-0x95)/255,1-this.k*(0xff-0xED)/255 ),
			reanimate();} )
		.start();
	reanimate();
}
