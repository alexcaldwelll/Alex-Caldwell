export function drawRoad(context: CanvasRenderingContext2D, width: number, height: number, distance: number, stopped: number) {
    const horizon = height * .35;
    const cx = width * .5;
    const baseWidth = Math.min(width * .20, height * .30);
    const bend = Math.sin(distance * .026) * width * .095 * (1 - stopped * .65);
    function point(z: number, side: number): [number, number] {
      const scale = 1 / (1 + z * .12);
      return [cx + bend * (1 - scale) ** 2 + side * baseWidth * scale, horizon + height * .76 * scale];
    }
    const ground = context.createLinearGradient(0,horizon,0,height);
    ground.addColorStop(0,"#f8efe3");ground.addColorStop(1,"#e9d9c0");
    context.fillStyle = ground;context.fillRect(0,horizon,width,height-horizon);
    function poly(points: [number, number][], color: string | CanvasGradient) {
      context.beginPath();points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));context.closePath();context.fillStyle=color;context.fill();
    }
    const depths = Array.from({length:37},(_,i)=>i*i*.22);
    poly([...depths.map(z=>point(z,-1.04)), ...[...depths].reverse().map(z=>point(z,1.04))],"#b5a489");
    const roadFill=context.createLinearGradient(0,horizon,0,height);
    roadFill.addColorStop(0,"#f5ecdd");roadFill.addColorStop(1,"#bfb39e");
    poly([...depths.map(z=>point(z,-1)), ...[...depths].reverse().map(z=>point(z,1))],roadFill);
    for(let z=8-(distance%8);z<160;z+=8) {
      poly([point(z,-.015),point(z,.015),point(z+3,.015),point(z+3,-.015)],"#f5e2b9");
      for(const s of [-1,1]) poly([point(z,s),point(z,s*1.065),point(z+.35,s*1.065),point(z+.35,s)],"#9e8b70");
    }
  }

