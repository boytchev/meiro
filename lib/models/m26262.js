
//	Основи на Компютърната Графика
//	Модел 26262 - Жестове с пръсти
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26262 = function M26262(room)
{
	MEIRO.Model.apply(this, arguments);

	var ratio = 0.85;
	var phalangGeometry = [];
		phalangGeometry[0] = new THREE.CylinderGeometry(ratio,1,2.6,32,1);
		phalangGeometry[1] = new THREE.CylinderGeometry(ratio,1,2,32,1);
	var jointGeometry = new THREE.SphereGeometry(1,32,32);
	var skinMaterial = new THREE.MeshPhongMaterial({color:'peachpuff',shininess:10});
	var nailMaterial = new THREE.MeshPhongMaterial({color:'red',shininess:200});
	phalangGeometry[0].translate(0,1.3,0);
	phalangGeometry[1].translate(0,1,0);

	function Finger(fa)
	{
		var finger = new THREE.Object3D();
		var f = finger;
		
		for (var i=0; i<3; i++)
		{
			f.add(new THREE.Mesh(jointGeometry,skinMaterial));
			f.add(new THREE.Mesh(phalangGeometry[fa],skinMaterial));
			f = f.children[0];
			f.scale.set(ratio,ratio,ratio);
			f.position.y = fa?2:2.6;
			f.rotation.x = 0.3;
		}

		finger.add(new THREE.Mesh(jointGeometry,skinMaterial));
			
		f.add(new THREE.Mesh(jointGeometry,nailMaterial));
		f = f.children[0];
		f.scale.set(0.8,1.7,0.25);
		f.position.z = -0.78;
		f.rotation.x = -0.2;

		return finger;
	}

	var posX = [-3,-1.8,0,1.8,3.1];
	var posY = [-1.8,0,0.5,0.1,-0.8];
	var sca = [1,0.9,1,0.9,0.7];
	this.rot = [1.5,0.3,0.1,-0.1,-0.4];
	
	this.leftHand = new THREE.Object3D();
	for (var i=0; i<5; i++)
	{
		this.leftHand.add(Finger(i==0?1:0));
		this.leftHand.children[i].position.set(posX[i],posY[i],0);
		this.leftHand.children[i].scale.set(sca[i],sca[i],sca[i]);
	}
	
	this.rightHand = new THREE.Object3D();
	for (var i=0; i<5; i++)
	{
		this.rightHand.add(Finger(i==0?1:0));
		this.rightHand.children[i].position.set(-posX[i],posY[i],0);
		this.rightHand.children[i].scale.set(sca[i],sca[i],sca[i]);
	}
	
	var that = this;
	this.gesture = new MEIRO.CornerButton('topLeft', function(){that.onGesture();}, 'Жест', 'images/n123.png');
	this.gesture.state = 0;
	this.gesture.hide();
	
	// сглобяване на целия модел
	this.image.add(this.leftHand,this.rightHand);
}

MEIRO.Models.M26262.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26262.DIST = {MIN:20, MAX:60, HEIGHT:0};
MEIRO.Models.M26262.POS = {DIST:30, ROT_X:1.4, ROT_Y:0.2};
MEIRO.Models.M26262.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26262.prototype.onAnimate = function(time)
{
	var k = 0.92;

	switch (this.gesture.state)
	{
		case 0:
				this.leftHand.position.x = 8*(1-k)+k*this.leftHand.position.x;
				this.leftHand.position.z = 6*Math.cos(0.004*time)*(1-k)+k*this.leftHand.position.z;
				this.leftHand.rotation.z = -1*(1-k)+k*this.leftHand.rotation.z;
				this.rightHand.position.x = -8*(1-k)+k*this.rightHand.position.x;
				this.rightHand.position.z = -6*Math.cos(0.004*time)*(1-k)+k*this.rightHand.position.z;
				this.rightHand.rotation.z = 1*(1-k)+k*this.rightHand.rotation.z;
				break;
		case 1:
				this.leftHand.position.x = 6*(1-k)+k*this.leftHand.position.x;
				this.leftHand.position.z = 0*(1-k)+k*this.leftHand.position.z;
				this.leftHand.rotation.z = -0*(1-k)+k*this.leftHand.rotation.z;
				this.rightHand.position.x = -6*(1-k)+k*this.rightHand.position.x;
				this.rightHand.position.z = -0*(1-k)+k*this.rightHand.position.z;
				this.rightHand.rotation.z = 0*(1-k)+k*this.rightHand.rotation.z;
				break;
		case 2:
				this.leftHand.position.x = 7*(1-k)+k*this.leftHand.position.x;
				this.leftHand.position.z = 0*(1-k)+k*this.leftHand.position.z;
				this.leftHand.rotation.z = -0.2*(1-k)+k*this.leftHand.rotation.z;
				this.rightHand.position.x = -7*(1-k)+k*this.rightHand.position.x;
				this.rightHand.position.z = -0*(1-k)+k*this.rightHand.position.z;
				this.rightHand.rotation.z = 0.2*(1-k)+k*this.rightHand.rotation.z;
				break;
	}

	for (var i=0; i<5; i++)
		for (var f=this.leftHand.children[i],n=0; n<3; f=f.children[0],n++)
		{
			var x,z;
			switch (this.gesture.state)
			{
				case 0:
					x = (i?0.1:0.2)+(i?1.5:0.8)*(0.6+0.4*Math.sin(0.004*time));
					z = n?0:this.rot[i];
					break;
				case 1:
					x = (i?0.2:0.7)+(i?1.5:0.1)*(0.35+0.35*Math.sin(0.006*time+i));
					z = n?0:this.rot[i];
					break;
				case 2:
					x = (i==1?0.2:1.2);
					z = n?0:this.rot[i]+0.2*Math.sin((i==1?0.01:0)*time);
					break;
			}
			f.rotation.set(f.rotation.x*k+(1-k)*x,0,f.rotation.z*k+(1-k)*z,'ZXY');
		}
	for (var i=0; i<5; i++)
		for (var f=this.rightHand.children[i],n=0; n<3; f=f.children[0],n++)
		{
			var x,z;
			switch (this.gesture.state)
			{
				case 0:
					x = (i?0.1:0.2)+(i?1.5:0.8)*(0.6-0.4*Math.sin(0.004*time));
					z = n?0:-this.rot[i];
					break;
				case 1:
					x = (i?0.2:0.7)+(i?1.5:0.1)*(0.35+0.35*Math.sin(0.006*time+i));
					z = n?0:-this.rot[i];
					break;
				case 2:
					x = (i==1?0.2:1.2);
					z = n?0:-this.rot[i]-0.2*Math.sin((i==1?0.01:0)*time);
					break;
			}
			f.rotation.set(f.rotation.x*k+(1-k)*x,0,f.rotation.z*k+(1-k)*z,'ZXY');
		}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26262.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Жестове с пръсти</h1>';

	s += '<p>Всяка от ръцете има по пет инстанции на пръсти. Всеки пръст е генериран на слоеве. Промяната на ъглите между всеки два слоя се контролира с функции &ndash; индивидуално за всеки от десетте пръста. Ако функциите са приемливо синхронизирани във времето, движението на пръстите се възприема като жестове.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M26262.prototype.onGesture = function(element)
{
	this.gesture.state = (this.gesture.state+1)%3;
}
