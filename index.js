import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useLoaders, useLocalPlayer} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');
const localVector = new THREE.Vector3();

export default () => {
  const app = useApp();
  const localPlayer = useLocalPlayer();
  let action;
  let mixer;

  let o;
  (async () => {
    const u = `${baseUrl}ethereum_3d_v1_vian.glb`;
    o = await new Promise((accept, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    
    const {animations} = o;
    app.add(o.scene);
    mixer = new THREE.AnimationMixer(o.scene);
    action = mixer.clipAction(o.animations[0]);
    
    action.play();
  })();



  const texture = new THREE.TextureLoader().load(`${baseUrl}sparkle.png`);

  const particleCount = 10;
  let info = {
      velocity: [particleCount],
      rotate: [particleCount]
  }
  const acc = new THREE.Vector3(0, -0.001, 0);
  let mesh = null;
  let dummy = new THREE.Object3D();
  let matrix = new THREE.Matrix4();
  let position = new THREE.Vector3();
  let coinPosition=null;

  function addInstancedMesh() {
    
      mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry( .5, .5 ), new THREE.MeshBasicMaterial({ color: 0xC10F86,transparent: true, map: texture, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), particleCount);
      
      app.add(mesh);
      setInstancedMeshPositions(mesh);
  }
  function setInstancedMeshPositions(mesh1) {
      for (let i = 0; i < mesh1.count; i++) {
        
          info.velocity[i] = (new THREE.Vector3(
              (Math.random() - 0.5)*.5,
              Math.random() * 1.,
              (Math.random() - 0.5)*.5));
          info.velocity[i].divideScalar(20);
          info.rotate[i] = new THREE.Vector3(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5); 
          //o.scene.getWorldPosition(localVector);
          // dummy.position.y= localPlayer.pos.y;
          //console.log(coinPosition);
          dummy.position.set(coinPosition.x,coinPosition.y,coinPosition.z);
          // matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
          // dummy.scale.x*=Math.random();
          // dummy.scale.y*=Math.random();
          // dummy.scale.z*=Math.random();
          // dummy.quaternion.x+=Math.random();
          // dummy.quaternion.y+=Math.random();
          // dummy.quaternion.z+=Math.random();
         
          dummy.updateMatrix();
          mesh1.setMatrixAt(i, dummy.matrix);
      }
      mesh1.instanceMatrix.needsUpdate = true;
  }
  

  // const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  // const geometry = new THREE.PlaneGeometry( 1, 1 );
  // const cube = new THREE.Mesh( geometry, material );
  // cube.position.y=1;
  // app.add( cube );
  app.updateMatrixWorld();



  
  useFrame(({timestamp, timeDiff}) => {
    if(mixer)
    {   
        o.scene.getWorldPosition(localVector)
        coinPosition=localVector;
        // console.log(localPlayer.position);
        if(localVector.distanceTo(new THREE.Vector3(localPlayer.position.x,localPlayer.position.y-1.189,localPlayer.position.z) )<=1){
            app.remove(o.scene);
            // o.scene.position.x+=(Math.random()-0.5)*4;
            // o.scene.position.z+=(Math.random()-0.5)*4;
            // o.scene.position.y=0.1;
            addInstancedMesh();
        }
        //console.log(localVector.distanceTo(new THREE.Vector3(localPlayer.position.x,localPlayer.position.y-1.25,localPlayer.position.z) ));
        mixer.update(timeDiff/1000);
        o.scene.updateMatrixWorld();
    }
    if (mesh) {
      for (let i = 0; i < particleCount; i++) {
        mesh.getMatrixAt(i, matrix);


        position.setFromMatrixPosition(matrix); // extract position form transformationmatrix

       
        matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        
        dummy.rotation.x += timestamp * (i % 2 == 0 ? -1 : 1);
        //dummy.scale.y *= 0.95;

        if (dummy.position.y < 0 || dummy.position.y > 10) {
          
          // dummy.position.x = 1;
          // dummy.position.y = 1.5;
          // dummy.position.z = 1;
          // info.velocity[i] = (new THREE.Vector3(
          //   (Math.random() - 0.5)*4.,
          //   Math.random() *8.,
          //   (Math.random() - 0.5)*4.));
          // info.velocity[i].divideScalar(20);
          // dummy.geometry.dispose();
          // dummy.material.dispose();
          dummy.scale.x=0;
          dummy.scale.y=0;
          dummy.scale.z=0;
          //app.remove( dummy );
        }
        info.velocity[i].add(acc);
        
        dummy.position.add(info.velocity[i]);

        dummy.updateMatrix();
        
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.instanceMatrix.needsUpdate = true;

      }


  }




  });

  return app;
};

