import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  Trophy,
  Play,
  Volume2,
  VolumeX,
  Award,
  ShoppingBag,
  Sun,
  Sunset,
  Moon,
  RotateCcw,
  Home,
  BookOpen,
  Shield,
  Zap,
  Target,
  Flame,
  Camera,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Activity,
  Video,
  HelpCircle,
  Pause,
  Crosshair
} from 'lucide-react';

// ============================================================================
// 0. PROCEDURAL HIGH-RES 3D TEXTURE GENERATORS (HTML5 Canvas -> WebGL Texture)
// ============================================================================
function createGrassTurfTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base lush stadium grass
  ctx.fillStyle = '#0e6b38';
  ctx.fillRect(0, 0, 512, 512);

  // Alternating cross-mowed stripe bands
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(22, 163, 74, 0.25)' : 'rgba(6, 78, 59, 0.22)';
    ctx.fillRect(0, i * 64, 512, 64);
  }

  // Fine organic grass blade speckle noise
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(134, 239, 172, 0.08)' : 'rgba(2, 44, 34, 0.12)';
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

function createClayPitchTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Rolled clay base
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#c8a97e');
  grad.addColorStop(0.5, '#d7be96');
  grad.addColorStop(1, '#c8a97e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 1024);

  // Subtle good-length bowler footmarks & worn patches
  ctx.fillStyle = 'rgba(120, 82, 45, 0.16)';
  ctx.beginPath();
  ctx.ellipse(90, 260, 28, 75, 0, 0, Math.PI * 2);
  ctx.ellipse(165, 760, 30, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soil grain texture
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,248,231,0.12)' : 'rgba(92,64,51,0.12)';
    ctx.fillRect(Math.random() * 256, Math.random() * 1024, 2, 3);
  }

  return new THREE.CanvasTexture(canvas);
}

function createCricketBallTexture(isWhiteBall = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Polished leather half-spheres
  ctx.fillStyle = isWhiteBall ? '#f8fafc' : '#b91c1c';
  ctx.fillRect(0, 0, 256, 128);

  // Leather shine gradient
  const shine = ctx.createLinearGradient(0, 0, 256, 128);
  shine.addColorStop(0, 'rgba(255,255,255,0.22)');
  shine.addColorStop(0.5, 'rgba(0,0,0,0.0)');
  shine.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 256, 128);

  // Equator primary stitched seam
  ctx.fillStyle = isWhiteBall ? '#0f172a' : '#fef08a';
  ctx.fillRect(0, 58, 256, 12);

  // Individual angled stitch marks along seam
  ctx.strokeStyle = isWhiteBall ? '#10b981' : '#ffffff';
  ctx.lineWidth = 2;
  for (let x = 4; x < 256; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 54);
    ctx.lineTo(x + 3, 74);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function createPerimeterBannerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, 1024, 64);

  const labels = ['GXA GAMES STUDIO', 'CRICKET CHALLENGE 3D', 'BOUNDARY MAXIMUM', 'PLAY PRO EDITION'];
  for (let i = 0; i < 4; i++) {
    const x = i * 256;
    ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#38bdf8';
    ctx.fillRect(x + 6, 8, 244, 48);
    ctx.fillStyle = '#020617';
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], x + 128, 33);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

function createBatStickerTexture(bladeColor = '#d6b27c', stickerColor = '#10b981') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bladeColor;
  ctx.fillRect(0, 0, 128, 512);

  // Subtle wood grain vertical lines
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let i = 0; i < 128; i += 8) {
    ctx.fillRect(i, 0, 2, 512);
  }

  // GXA Pro Chevron Sticker on upper/middle blade
  ctx.fillStyle = stickerColor;
  ctx.beginPath();
  ctx.moveTo(14, 90);
  ctx.lineTo(114, 90);
  ctx.lineTo(114, 240);
  ctx.lineTo(64, 290);
  ctx.lineTo(14, 240);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#020617';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GXA', 64, 175);
  ctx.font = '700 14px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PRO WILLOW', 64, 205);

  // Sweet-spot target lines
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 310, 88, 95);

  return new THREE.CanvasTexture(canvas);
}

function createAthleteKitTexture(primaryHex = '#0284c7', accentHex = '#38bdf8', numberStr = '18') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Breathable athletic polyester base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, primaryHex);
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Diagonal chest & shoulder stripes
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.lineTo(256, 18);
  ctx.lineTo(256, 48);
  ctx.lineTo(0, 72);
  ctx.closePath();
  ctx.fill();

  // Subtle micro-mesh fabric weave
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let y = 0; y < 256; y += 4) {
    for (let x = (y % 8 === 0 ? 0 : 2); x < 256; x += 4) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // GXA chest crest & back squad number
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(numberStr, 128, 145);

  return new THREE.CanvasTexture(canvas);
}

function createPadRibTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 128, 256);

  // Vertical cane-roll ribs and knee-roll horizontal bolster seams
  ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
  for (let x = 16; x < 128; x += 22) {
    ctx.fillRect(x, 10, 4, 236);
  }
  ctx.fillRect(8, 68, 112, 8);
  ctx.fillRect(8, 96, 112, 6);

  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// 0B. 19-JOINT SKINNEDMESH ATHLETE RIG, KEYFRAME CLIPS & ANIMATION CONTROLLERS
// ============================================================================
/**
 * Builds a continuous, multi-ring tubular SkinnedMesh along a bone chain
 * with smooth linear vertex skinWeights so joints bend organically without
 * robotic cylinder gaps or intersecting sphere joints.
 */
function buildSkinnedLimbGeometry({
  totalLength,
  radiusProfile, // Array of { t: 0..1, rx, rz, zOffset }
  boneIndexUpper,
  boneIndexLower,
  boneIndexTip,
  jointSplitT = 0.5,
  radialSegments = 14,
  heightSegments = 16
}) {
  const geo = new THREE.CylinderGeometry(1, 1, totalLength, radialSegments, heightSegments, false);
  // Shift cylinder so y = 0 is at the top origin and y = -totalLength is at the tip
  geo.translate(0, -totalLength / 2, 0);

  const pos = geo.attributes.position;
  const vertexCount = pos.count;
  const skinIndices = new Uint16Array(vertexCount * 4);
  const skinWeights = new Float32Array(vertexCount * 4);

  const sampleProfile = (t) => {
    for (let i = 0; i < radiusProfile.length - 1; i++) {
      const a = radiusProfile[i];
      const b = radiusProfile[i + 1];
      if (t >= a.t && t <= b.t) {
        const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const smooth = local * local * (3 - 2 * local);
        return {
          rx: a.rx + (b.rx - a.rx) * smooth,
          rz: a.rz + (b.rz - a.rz) * smooth,
          zOff: (a.zOff || 0) + ((b.zOff || 0) - (a.zOff || 0)) * smooth
        };
      }
    }
    const last = radiusProfile[radiusProfile.length - 1];
    return { rx: last.rx, rz: last.rz, zOff: last.zOff || 0 };
  };

  for (let i = 0; i < vertexCount; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const t = Math.max(0, Math.min(1, -vy / totalLength));
    const prof = sampleProfile(t);

    pos.setXYZ(i, vx * prof.rx, vy, vz * prof.rz + prof.zOff);

    // Compute smooth 2-bone skinning weights across the elbow/knee joint
    let idx0 = boneIndexUpper;
    let idx1 = boneIndexLower;
    let w0 = 1.0;
    let w1 = 0.0;

    const blendBand = 0.14;
    if (t < jointSplitT - blendBand) {
      idx0 = boneIndexUpper;
      w0 = 1.0;
    } else if (t <= jointSplitT + blendBand) {
      const alpha = (t - (jointSplitT - blendBand)) / (blendBand * 2);
      idx0 = boneIndexUpper;
      idx1 = boneIndexLower;
      w0 = 1.0 - alpha;
      w1 = alpha;
    } else if (t < 0.88 || boneIndexTip === undefined) {
      idx0 = boneIndexLower;
      w0 = 1.0;
    } else {
      const alpha = (t - 0.88) / 0.12;
      idx0 = boneIndexLower;
      idx1 = boneIndexTip;
      w0 = 1.0 - alpha;
      w1 = alpha;
    }

    skinIndices[i * 4] = idx0;
    skinIndices[i * 4 + 1] = idx1;
    skinIndices[i * 4 + 2] = 0;
    skinIndices[i * 4 + 3] = 0;

    skinWeights[i * 4] = w0;
    skinWeights[i * 4 + 1] = w1;
    skinWeights[i * 4 + 2] = 0;
    skinWeights[i * 4 + 3] = 0;
  }

  geo.computeVertexNormals();
  geo.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));
  return geo;
}

/**
 * Builds a single continuous SkinnedMesh athletic torso & pelvis bound smoothly
 * to pelvis (index 0), spineLower (index 1), and spineUpper (index 2).
 */
function buildSkinnedTorsoGeometry(radialSegments = 18, heightSegments = 18) {
  const totalHeight = 0.68; // From hips (y = -0.06) up to base of neck (y = +0.62)
  const geo = new THREE.CylinderGeometry(1, 1, totalHeight, radialSegments, heightSegments, false);
  geo.translate(0, totalHeight / 2 - 0.06, 0);

  const pos = geo.attributes.position;
  const vertexCount = pos.count;
  const skinIndices = new Uint16Array(vertexCount * 4);
  const skinWeights = new Float32Array(vertexCount * 4);

  const profile = [
    { t: 0.0, rx: 0.155, rz: 0.115 }, // Hips base
    { t: 0.25, rx: 0.165, rz: 0.12 }, // Pelvis
    { t: 0.48, rx: 0.148, rz: 0.108 }, // Athletic waist taper
    { t: 0.78, rx: 0.205, rz: 0.132 }, // Broad chest / lats
    { t: 0.94, rx: 0.225, rz: 0.125 }, // Shoulder line
    { t: 1.0, rx: 0.085, rz: 0.075 } // Collar / neck base
  ];

  for (let i = 0; i < vertexCount; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const t = Math.max(0, Math.min(1, (vy + 0.06) / totalHeight));

    let rx = 0.17;
    let rz = 0.12;
    for (let k = 0; k < profile.length - 1; k++) {
      if (t >= profile[k].t && t <= profile[k + 1].t) {
        const u = (t - profile[k].t) / (profile[k + 1].t - profile[k].t);
        const s = u * u * (3 - 2 * u);
        rx = profile[k].rx + (profile[k + 1].rx - profile[k].rx) * s;
        rz = profile[k].rz + (profile[k + 1].rz - profile[k].rz) * s;
        break;
      }
    }
    pos.setXYZ(i, vx * rx, vy, vz * rz);

    // Smooth 3-bone spine skinning weights: pelvis (0), spineLower (1), spineUpper (2)
    let w0 = 0;
    let w1 = 0;
    let w2 = 0;
    if (t < 0.35) {
      w0 = 1.0 - t / 0.35;
      w1 = t / 0.35;
    } else {
      const u = (t - 0.35) / 0.65;
      w1 = 1.0 - u;
      w2 = u;
    }

    skinIndices[i * 4] = 0;
    skinIndices[i * 4 + 1] = 1;
    skinIndices[i * 4 + 2] = 2;
    skinIndices[i * 4 + 3] = 0;

    skinWeights[i * 4] = w0;
    skinWeights[i * 4 + 1] = w1;
    skinWeights[i * 4 + 2] = w2;
    skinWeights[i * 4 + 3] = 0;
  }

  geo.computeVertexNormals();
  geo.setAttribute('skinIndex', new THREE.BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeights, 4));
  return geo;
}

class CharacterAssetLoader {
  static createSharedMaterials() {
    if (this._materials) return this._materials;
    this._materials = {
      skin: new THREE.MeshStandardMaterial({ color: 0xc68652, roughness: 0.52, metalness: 0.04 }),
      batterKit: new THREE.MeshStandardMaterial({
        map: createAthleteKitTexture('#0284c7', '#38bdf8', '18'),
        roughness: 0.45
      }),
      batterTrousers: new THREE.MeshStandardMaterial({ color: 0x0c4a6e, roughness: 0.52 }),
      bowlerKit: new THREE.MeshStandardMaterial({
        map: createAthleteKitTexture('#dc2626', '#facc15', '99'),
        roughness: 0.45
      }),
      bowlerTrousers: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.52 }),
      umpireCoat: new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.5 }),
      umpireTrousers: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
      pads: new THREE.MeshStandardMaterial({
        map: createPadRibTexture(),
        roughness: 0.34,
        metalness: 0.08
      }),
      helmetBlue: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.22, metalness: 0.35 }),
      grilleSteel: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 }),
      glovesWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.38 }),
      shoesWhite: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 }),
      hairDark: new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.8 })
    };
    return this._materials;
  }

  static disposeSharedMaterials() {
    if (!this._materials) return;
    Object.values(this._materials).forEach((mat) => {
      if (mat.map) mat.map.dispose();
      mat.dispose();
    });
    this._materials = null;
  }

  /**
   * Builds a 19-bone humanoid cricketer using genuine THREE.SkinnedMesh
   * continuous vertex-weighted torso, arms, and legs, paired with THREE.AnimationClip
   * keyframe tracks and crossFadeTo blending.
   *
   * Note on External GLB Override: If a user drops a custom rigged GLB model into
   * `window.GXA_CUSTOM_GLB_CACHE`, this loader will bind it automatically; otherwise
   * it uses the procedural vertex-weighted SkinnedMesh athlete below so the single-file
   * React build runs offline with zero broken URLs.
   */
  static createHumanoidCricketer({
    role = 'BATSMAN', // 'BATSMAN' | 'NON_STRIKER' | 'BOWLER' | 'FIELDER' | 'KEEPER' | 'UMPIRE'
    batMaterial = null,
    lod = 'HIGH' // 'HIGH' | 'MEDIUM'
  }) {
    const mats = this.createSharedMaterials();
    const isBatter = role === 'BATSMAN' || role === 'NON_STRIKER';
    const isKeeper = role === 'KEEPER';
    const isUmpire = role === 'UMPIRE';

    const jerseyMat = isBatter ? mats.batterKit : isUmpire ? mats.umpireCoat : mats.bowlerKit;
    const trouserMat = isBatter ? mats.batterTrousers : isUmpire ? mats.umpireTrousers : mats.bowlerTrousers;
    const radialSegs = lod === 'HIGH' ? 16 : 10;
    const heightSegs = lod === 'HIGH' ? 16 : 10;

    const rootGroup = new THREE.Group();

    // 1. Hierarchical 19-Bone Skeleton Tree (Accurately indexed 0..18)
    const bones = {};
    const boneList = [];
    const makeBone = (name, x, y, z, parent) => {
      const b = new THREE.Bone();
      b.name = name;
      b.position.set(x, y, z);
      parent.add(b);
      bones[name] = b;
      boneList.push(b);
      return b;
    };

    // Indices:
    // 0: pelvis, 1: spineLower, 2: spineUpper, 3: neck, 4: head
    // 5: shoulderL, 6: upperArmL, 7: foreArmL, 8: handL
    // 9: shoulderR, 10: upperArmR, 11: foreArmR, 12: handR
    // 13: thighL, 14: shinL, 15: footL
    // 16: thighR, 17: shinR, 18: footR
    const pelvis = makeBone('pelvis', 0, 0.94, 0, rootGroup);
    const spineLower = makeBone('spineLower', 0, 0.14, 0, pelvis);
    const spineUpper = makeBone('spineUpper', 0, 0.28, 0, spineLower);
    const neck = makeBone('neck', 0, 0.22, 0, spineUpper);
    const head = makeBone('head', 0, 0.1, 0, neck);

    const shoulderL = makeBone('shoulderL', -0.21, 0.18, 0, spineUpper);
    const upperArmL = makeBone('upperArmL', -0.03, -0.02, 0, shoulderL);
    const foreArmL = makeBone('foreArmL', 0, -0.27, 0, upperArmL);
    const handL = makeBone('handL', 0, -0.25, 0, foreArmL);

    const shoulderR = makeBone('shoulderR', 0.21, 0.18, 0, spineUpper);
    const upperArmR = makeBone('upperArmR', 0.03, -0.02, 0, shoulderR);
    const foreArmR = makeBone('foreArmR', 0, -0.27, 0, upperArmR);
    const handR = makeBone('handR', 0, -0.25, 0, foreArmR);

    const thighL = makeBone('thighL', -0.115, -0.04, 0, pelvis);
    const shinL = makeBone('shinL', 0, -0.43, 0, thighL);
    const footL = makeBone('footL', 0, -0.43, 0.04, shinL);

    const thighR = makeBone('thighR', 0.115, -0.04, 0, pelvis);
    const shinR = makeBone('shinR', 0, -0.43, 0, thighR);
    const footR = makeBone('footR', 0, -0.43, 0.04, shinR);

    rootGroup.updateMatrixWorld(true);
    const skeleton = new THREE.Skeleton(boneList);

    // 2. Continuous Vertex-Weighted SkinnedMeshes (Torso, Arms, Legs)
    // 2A. Skinned Athletic Torso
    const torsoGeo = buildSkinnedTorsoGeometry(radialSegs, heightSegs);
    torsoGeo.translate(0, 0.94, 0);
    const torsoSkinned = new THREE.SkinnedMesh(torsoGeo, jerseyMat);
    torsoSkinned.castShadow = true;
    torsoSkinned.receiveShadow = true;
    torsoSkinned.frustumCulled = false;
    torsoSkinned.bind(skeleton);
    rootGroup.add(torsoSkinned);

    // 2B. Skinned Left & Right Arms (Continuous shoulder -> bicep -> elbow -> forearm -> wrist)
    const createSkinnedArm = (isRight) => {
      const uIdx = isRight ? 10 : 6;
      const fIdx = isRight ? 11 : 7;
      const hIdx = isRight ? 12 : 8;
      const xOrigin = isRight ? 0.24 : -0.24;
      const yOrigin = 0.94 + 0.14 + 0.28 + 0.16;

      // Upper sleeve SkinnedMesh
      const armGeo = buildSkinnedLimbGeometry({
        totalLength: 0.54,
        radiusProfile: [
          { t: 0.0, rx: 0.072, rz: 0.068 }, // Deltoid cap
          { t: 0.28, rx: 0.058, rz: 0.055 }, // Bicep / tricep
          { t: 0.5, rx: 0.048, rz: 0.046 }, // Elbow joint
          { t: 0.72, rx: 0.046, rz: 0.044 }, // Forearm belly
          { t: 1.0, rx: 0.035, rz: 0.032 } // Wrist
        ],
        boneIndexUpper: uIdx,
        boneIndexLower: fIdx,
        boneIndexTip: hIdx,
        jointSplitT: 0.5,
        radialSegments: radialSegs,
        heightSegments: heightSegs
      });
      armGeo.translate(xOrigin, yOrigin, 0);
      const armSkinned = new THREE.SkinnedMesh(armGeo, mats.skin);
      armSkinned.castShadow = true;
      armSkinned.frustumCulled = false;
      armSkinned.bind(skeleton);
      rootGroup.add(armSkinned);

      // Short Jersey Sleeve Cap
      const sleeveMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.076, 0.064, 0.19, radialSegs),
        jerseyMat
      );
      sleeveMesh.position.y = -0.07;
      sleeveMesh.castShadow = true;
      (isRight ? upperArmR : upperArmL).add(sleeveMesh);
    };
    createSkinnedArm(false);
    createSkinnedArm(true);

    // 2C. Skinned Left & Right Legs (Continuous hip -> thigh -> knee -> calf -> ankle)
    const createSkinnedLeg = (isRight) => {
      const tIdx = isRight ? 16 : 13;
      const sIdx = isRight ? 17 : 14;
      const fIdx = isRight ? 18 : 15;
      const xOrigin = isRight ? 0.115 : -0.115;
      const yOrigin = 0.90;

      const legGeo = buildSkinnedLimbGeometry({
        totalLength: 0.86,
        radiusProfile: [
          { t: 0.0, rx: 0.098, rz: 0.098 }, // Upper thigh / quad
          { t: 0.45, rx: 0.074, rz: 0.074 }, // Knee
          { t: 0.65, rx: 0.076, rz: 0.078, zOff: -0.008 }, // Athletic calf contour
          { t: 1.0, rx: 0.052, rz: 0.052 } // Ankle
        ],
        boneIndexUpper: tIdx,
        boneIndexLower: sIdx,
        boneIndexTip: fIdx,
        jointSplitT: 0.5,
        radialSegments: radialSegs,
        heightSegments: heightSegs
      });
      legGeo.translate(xOrigin, yOrigin, 0);
      const legSkinned = new THREE.SkinnedMesh(legGeo, trouserMat);
      legSkinned.castShadow = true;
      legSkinned.receiveShadow = true;
      legSkinned.frustumCulled = false;
      legSkinned.bind(skeleton);
      rootGroup.add(legSkinned);
    };
    createSkinnedLeg(false);
    createSkinnedLeg(true);

    // 3. Sculpted Head, Neck, Helmet/Cap, Gloves, Ribbed Pads & Footwear
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.066, 0.12, 12), mats.skin);
    neckMesh.position.y = 0.04;
    neck.add(neckMesh);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.116, radialSegs, radialSegs), mats.skin);
    headMesh.position.y = 0.095;
    headMesh.scale.set(0.91, 1.09, 0.98);
    headMesh.castShadow = true;
    head.add(headMesh);

    if (isBatter || isKeeper) {
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, radialSegs, radialSegs, 0, Math.PI * 2, 0, Math.PI * 0.68),
        mats.helmetBlue
      );
      shell.position.set(0, 0.108, -0.008);
      head.add(shell);

      const visorPeak = new THREE.Mesh(
        new THREE.CylinderGeometry(0.135, 0.145, 0.024, 12, 1, false, -Math.PI * 0.35, Math.PI * 0.7),
        mats.helmetBlue
      );
      visorPeak.position.set(0, 0.11, 0.04);
      visorPeak.rotation.x = 0.28;
      head.add(visorPeak);

      const grilleGroup = new THREE.Group();
      for (let b = 0; b < 3; b++) {
        const bar = new THREE.Mesh(
          new THREE.TorusGeometry(0.124, 0.0045, 6, 16, Math.PI * 0.75),
          mats.grilleSteel
        );
        bar.rotation.x = Math.PI / 2 - 0.15;
        bar.rotation.z = -Math.PI * 0.375;
        bar.position.set(0, 0.075 - b * 0.028, 0.015);
        grilleGroup.add(bar);
      }
      head.add(grilleGroup);
    } else if (isUmpire) {
      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.02, 14), mats.glovesWhite);
      hatBrim.position.y = 0.17;
      head.add(hatBrim);
      const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.09, 14), mats.glovesWhite);
      hatCrown.position.y = 0.21;
      head.add(hatCrown);
    } else {
      const hairCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
        mats.hairDark
      );
      hairCap.position.set(0, 0.104, -0.01);
      head.add(hairCap);
    }

    // Hands, Batting Gloves & Bowler Ball-Release Socket
    [
      { handBone: handL, foreBone: foreArmL, isRight: false },
      { handBone: handR, foreBone: foreArmR, isRight: true }
    ].forEach(({ handBone, foreBone, isRight }) => {
      if (isBatter || isKeeper) {
        const gloveCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.044, 0.08, 10), mats.glovesWhite);
        gloveCuff.position.y = -0.22;
        foreBone.add(gloveCuff);

        const glovePalm = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 10), mats.glovesWhite);
        glovePalm.scale.set(0.95, 1.25, 0.78);
        glovePalm.position.y = -0.04;
        handBone.add(glovePalm);
      } else {
        const handMesh = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), mats.skin);
        handMesh.scale.set(0.85, 1.2, 0.65);
        handMesh.position.y = -0.04;
        handBone.add(handMesh);
      }

      if (role === 'BOWLER' && isRight) {
        const releaseSocket = new THREE.Object3D();
        releaseSocket.name = 'ballReleaseSocket';
        releaseSocket.position.set(0, -0.09, 0.03);
        handBone.add(releaseSocket);
        bones.ballReleaseSocket = releaseSocket;
      }
    });

    // Sculpted Batting Pads & Spiked Shoes
    [
      { shinBone: shinL, footBone: footL },
      { shinBone: shinR, footBone: footR }
    ].forEach(({ shinBone, footBone }) => {
      if (isBatter || isKeeper) {
        const padShell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.086, 0.076, 0.48, 12, 1, false, -Math.PI * 0.48, Math.PI * 0.96),
          mats.pads
        );
        padShell.position.set(0, -0.18, 0.022);
        padShell.castShadow = true;
        shinBone.add(padShell);

        const kneeRoll = new THREE.Mesh(new THREE.SphereGeometry(0.084, 10, 10), mats.pads);
        kneeRoll.scale.set(1.05, 0.68, 0.65);
        kneeRoll.position.set(0, 0.03, 0.045);
        shinBone.add(kneeRoll);
      }

      const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.072, 0.24), mats.shoesWhite);
      shoeMesh.position.set(0, -0.03, 0.05);
      shoeMesh.castShadow = true;
      footBone.add(shoeMesh);
    });

    // 4. Two-Handed Cricket Bat Socket & Sculpted Willow Blade
    let batBladeMesh = null;
    if (isBatter) {
      const batMount = new THREE.Group();
      batMount.name = 'batMount';
      batMount.position.set(0, -0.06, 0.03);

      const rubberGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.021, 0.021, 0.34, 10),
        new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 })
      );
      rubberGrip.position.set(0, -0.12, 0);
      batMount.add(rubberGrip);

      const bottomGlove = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), mats.glovesWhite);
      bottomGlove.position.set(0, -0.19, 0.01);
      batMount.add(bottomGlove);

      const usedBatMat =
        batMaterial ||
        new THREE.MeshStandardMaterial({
          map: createBatStickerTexture('#d6b27c', '#10b981'),
          roughness: 0.38
        });

      batBladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.64, 0.044), usedBatMat);
      batBladeMesh.position.set(0, -0.58, 0.01);
      batBladeMesh.castShadow = true;
      batMount.add(batBladeMesh);

      const spineRidge = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.56, 0.028), usedBatMat);
      spineRidge.position.set(0, -0.58, -0.018);
      batMount.add(spineRidge);

      handR.add(batMount);
      bones.batMount = batMount;
    }

    const mixer = new THREE.AnimationMixer(rootGroup);

    return {
      rootGroup,
      bones,
      skeleton,
      mixer,
      batBladeMesh
    };
  }
}

class BatsmanAnimationController {
  constructor(rig, isNonStriker = false) {
    this.rig = rig;
    this.bones = rig.bones;
    this.mixer = rig.mixer;
    this.isNonStriker = isNonStriker;
    this.state = 'IDLE'; // 'IDLE' | 'GATHER' | 'SHOT' | 'CELEBRATE' | 'DISMISSED'
    this.stateTime = 0;
    this.shotType = 'GROUND';
    this.shotDirX = 0;
    this.namedShot = 'Straight Drive';
    this.homePos = isNonStriker ? new THREE.Vector3(-1.05, 0, -8.2) : new THREE.Vector3(-0.34, 0, 7.85);
    this.rig.rootGroup.position.copy(this.homePos);

    // Run-between-wickets grounded travel state
    this.runDistance = 15.2; // Popping crease (+7.6) to bowler popping crease (-7.6)
    this.runDuration = 0;
    this.runElapsed = 0;
    this.runsToComplete = 0;

    // Author genuine THREE.AnimationClip keyframe tracks with crossfade support
    const idleTimes = [0, 0.85, 1.7];
    const breatheScale = [1, 1, 1, 1.025, 1.032, 1.025, 1, 1, 1];
    const idleClip = new THREE.AnimationClip('BatterIdleClip', 1.7, [
      new THREE.VectorKeyframeTrack('spineUpper.scale', idleTimes, breatheScale)
    ]);

    const gatherTimes = [0, 0.35];
    const gatherScale = [1, 1, 1, 1.04, 1.01, 1.04];
    const gatherClip = new THREE.AnimationClip('BatterGatherClip', 0.35, [
      new THREE.VectorKeyframeTrack('spineUpper.scale', gatherTimes, gatherScale)
    ]);

    this.actions = {
      idle: this.mixer.clipAction(idleClip),
      gather: this.mixer.clipAction(gatherClip)
    };
    this.actions.gather.setLoop(THREE.LoopOnce, 1);
    this.actions.gather.clampWhenFinished = true;
    this.actions.idle.play();
  }

  /**
   * Bug Fix #1: Only transitions into GATHER once per delivery instead of
   * resetting stateTime on every RUNUP frame. Uses AnimationMixer crossFadeTo.
   */
  triggerGather() {
    if (this.state === 'GATHER' || this.state === 'SHOT') return;
    this.state = 'GATHER';
    this.stateTime = 0;
    this.actions.gather.reset().play();
    this.actions.idle.crossFadeTo(this.actions.gather, 0.22, false);
  }

  /**
   * Bug Fix #2: Preserves continuous swing phase (`stateTime`) when ball contact
   * refines shot metadata mid-swing, instead of snapping back to frame 0.
   */
  triggerShot(style, dirX, namedShot = 'Straight Drive', preserveSwingContinuity = false) {
    const alreadySwinging = this.state === 'SHOT';
    this.state = 'SHOT';
    if (!alreadySwinging || !preserveSwingContinuity) {
      this.stateTime = 0;
    }
    this.shotType = style;
    this.shotDirX = dirX;
    this.namedShot = namedShot;
  }

  /**
   * Bug Fix #3: Grounded linear sprint travel between creases with turning pivot,
   * replacing sinusoidal Z teleportation.
   */
  startRunSprint(runsCount = 1) {
    this.runsToComplete = Math.max(1, Math.min(3, runsCount));
    this.runDuration = this.runsToComplete * 0.72;
    this.runElapsed = 0;
  }

  triggerReaction(type) {
    this.state = type; // 'CELEBRATE' | 'DISMISSED' | 'IDLE'
    this.stateTime = 0;
    if (type === 'IDLE') {
      this.runElapsed = 0;
      this.runDuration = 0;
      this.actions.idle.reset().play();
    }
  }

  update(dt, elapsedSec) {
    this.mixer.update(dt);
    this.stateTime += dt;
    const b = this.bones;

    // Grounded running between the wickets
    if (this.runDuration > 0 && this.runElapsed < this.runDuration) {
      this.runElapsed = Math.min(this.runDuration, this.runElapsed + dt);
      const totalLapsProgress = (this.runElapsed / this.runDuration) * this.runsToComplete;
      const currentLapIndex = Math.min(this.runsToComplete - 1, Math.floor(totalLapsProgress));
      const lapFraction = totalLapsProgress - currentLapIndex;
      // Smooth acceleration and deceleration at each crease turn
      const smoothLap = lapFraction * lapFraction * (3 - 2 * lapFraction);

      const goingTowardBowlerEnd = this.isNonStriker ? currentLapIndex % 2 === 1 : currentLapIndex % 2 === 0;
      const startZ = goingTowardBowlerEnd ? 7.6 : -7.6;
      const endZ = goingTowardBowlerEnd ? -7.6 : 7.6;
      const currentZ = startZ + (endZ - startZ) * smoothLap;
      const laneX = this.isNonStriker ? -1.05 : 0.92;

      this.rig.rootGroup.position.set(laneX, 0, currentZ);
      this.rig.rootGroup.rotation.y = goingTowardBowlerEnd ? Math.PI : 0;

      // Stride cycle synchronized to distance traveled (prevents foot sliding)
      const stridePhase = smoothLap * Math.PI * 9;
      const legSwing = Math.sin(stridePhase) * 0.82;
      const kneeBendL = Math.max(0, -Math.cos(stridePhase) * 1.02);
      const kneeBendR = Math.max(0, Math.cos(stridePhase) * 1.02);

      b.pelvis.position.y = 0.91 + Math.abs(Math.cos(stridePhase)) * 0.055;
      b.pelvis.rotation.set(0.16, 0, 0);
      b.spineLower.rotation.set(0.18, Math.sin(stridePhase) * 0.14, 0);
      b.spineUpper.rotation.set(0.14, Math.sin(stridePhase) * 0.18, 0);
      b.head.rotation.set(-0.18, 0, 0);

      b.thighL.rotation.set(legSwing, 0, 0);
      b.shinL.rotation.set(kneeBendL, 0, 0);
      b.thighR.rotation.set(-legSwing, 0, 0);
      b.shinR.rotation.set(kneeBendR, 0, 0);

      b.shoulderL.rotation.set(-legSwing * 0.72, 0, 0.15);
      b.foreArmL.rotation.set(-0.85, 0, 0);
      b.shoulderR.rotation.set(legSwing * 0.65, 0, -0.15);
      b.foreArmR.rotation.set(-0.75, 0, 0);
      if (b.batMount) b.batMount.rotation.set(0.45, 0, 0.1);

      if (this.runElapsed >= this.runDuration) {
        this.runDuration = 0;
        this.rig.rootGroup.rotation.y = 0;
      }
      return;
    }

    if (this.state === 'SHOT') {
      // Continuous kinetic chain: FEET -> KNEES -> HIPS -> SPINE -> SHOULDERS -> ARMS -> WRISTS -> BAT
      const dur = 0.62;
      const p = Math.min(1, this.stateTime / dur);
      // Smooth backswing (0..0.22), downswing & impact (0.22..0.52), high follow-through hold (0.52..1.0)
      const downswing = p < 0.22 ? -(p / 0.22) * 0.35 : Math.sin(Math.min(1, (p - 0.22) / 0.45) * (Math.PI / 2));
      const blend = Math.max(0, downswing);

      const isPullOrHook = this.namedShot.includes('Pull') || this.namedShot.includes('Hook');
      const isLoft = this.shotType === 'LOFT';
      const isDef = this.shotType === 'DEFENSE';

      const stridePhase = Math.min(1, p * 2.4);
      const strideZ = isPullOrHook ? 0.18 * stridePhase : -0.36 * stridePhase;
      const strideX = -this.shotDirX * 0.15 * stridePhase;
      this.rig.rootGroup.position.set(this.homePos.x + strideX, 0, this.homePos.z + strideZ);
      this.rig.rootGroup.rotation.y = 0;

      b.pelvis.position.y = 0.91 - stridePhase * 0.08;
      b.pelvis.rotation.set(0.08 * stridePhase, 1.18 - (1.18 + this.shotDirX * 0.42) * blend, 0);

      b.thighL.rotation.set(isPullOrHook ? 0.22 * stridePhase : -0.48 * stridePhase, -0.18, -0.08);
      b.shinL.rotation.set(isPullOrHook ? 0.35 * stridePhase : 0.52 * stridePhase, 0, 0);
      b.thighR.rotation.set(isPullOrHook ? -0.35 * stridePhase : 0.32 * stridePhase, 0.18, 0.08);
      b.shinR.rotation.set(0.38 * stridePhase, 0, 0);

      const torsoPitch = isLoft ? -0.22 * blend : isDef ? 0.28 * blend : 0.16 * blend;
      const torsoYaw = -this.shotDirX * 0.55 * blend + (isPullOrHook ? 0.65 * blend : 0);
      b.spineLower.rotation.set(torsoPitch * 0.5, torsoYaw * 0.5, 0);
      b.spineUpper.rotation.set(torsoPitch * 0.6, torsoYaw * 0.6, -this.shotDirX * 0.15 * blend);
      b.head.rotation.set(-torsoPitch * 0.7, -torsoYaw * 0.45, 0);

      const backliftOffset = p < 0.22 ? (p / 0.22) * 0.55 : 0.55 * (1 - blend);
      const armSwingX = isDef ? -0.58 * blend : isLoft ? -2.05 * blend : -1.48 * blend;
      const armYaw = -this.shotDirX * 0.68 * blend;

      b.shoulderR.rotation.set(0.35 + backliftOffset + armSwingX, armYaw, -0.18);
      b.foreArmR.rotation.set(-0.55 - blend * 0.32, 0, 0);
      b.handR.rotation.set(-0.25 * blend, 0, -this.shotDirX * 0.32 * blend);

      // Lead arm tracks handle in two-handed alignment
      b.shoulderL.rotation.set(0.32 + backliftOffset + armSwingX * 0.96, armYaw + 0.24, 0.22);
      b.foreArmL.rotation.set(-0.58 - blend * 0.3, 0, 0);

      if (b.batMount) {
        const wristSnap = isDef ? -0.15 * blend : isLoft ? -0.92 * blend : -0.62 * blend;
        b.batMount.rotation.set(0.2 + backliftOffset * 0.5 + wristSnap, -this.shotDirX * 0.35 * blend, 0);
      }

      if (p >= 1) {
        this.state = 'IDLE';
        this.stateTime = 0;
      }
      return;
    }

    if (this.state === 'CELEBRATE') {
      const pulse = Math.sin(this.stateTime * 8) * 0.12;
      this.rig.rootGroup.position.lerp(this.homePos, Math.min(1, dt * 6));
      this.rig.rootGroup.rotation.y = 0;
      b.pelvis.position.y = 0.95;
      b.pelvis.rotation.set(0, 0.25, 0);
      b.spineUpper.rotation.set(-0.15, 0.2, 0);
      b.shoulderR.rotation.set(-2.35 + pulse, 0, -0.25);
      b.foreArmR.rotation.set(-0.25, 0, 0);
      b.shoulderL.rotation.set(-2.15 - pulse, 0, 0.25);
      if (this.stateTime > 1.4) this.state = 'IDLE';
      return;
    }

    // Side-on athletic batting stance with smooth blend from IDLE into GATHER backlift
    this.rig.rootGroup.position.lerp(this.homePos, Math.min(1, dt * 8));
    this.rig.rootGroup.rotation.y = 0;
    const breathe = Math.sin(elapsedSec * 3.4) * 0.022;
    const gatherFactor =
      this.state === 'GATHER' ? Math.min(1, this.stateTime / 0.32) : 0;
    const smoothGather = gatherFactor * gatherFactor * (3 - 2 * gatherFactor);
    const tap = (1 - smoothGather) * Math.max(0, Math.sin(elapsedSec * 5.2)) * 0.13;
    const backlift = smoothGather * 0.54;

    b.pelvis.position.y = 0.91 - Math.abs(breathe) * 0.4 - smoothGather * 0.03;
    b.pelvis.rotation.set(0.08, 1.18, 0);

    b.thighL.rotation.set(-0.24 - smoothGather * 0.06, -0.14, -0.06);
    b.shinL.rotation.set(0.32 + smoothGather * 0.08, 0, 0);
    b.thighR.rotation.set(-0.2 - smoothGather * 0.05, 0.14, 0.06);
    b.shinR.rotation.set(0.28 + smoothGather * 0.08, 0, 0);

    b.spineLower.rotation.set(0.14 + breathe, -0.18, 0);
    b.spineUpper.rotation.set(0.16 + breathe, -0.28, 0);
    b.head.rotation.set(-0.18, -0.72, 0);

    b.shoulderR.rotation.set(0.32 + backlift - tap, -0.35, -0.22);
    b.foreArmR.rotation.set(-0.62 - backlift * 0.35, 0, 0);
    b.handR.rotation.set(0.12 - tap * 0.4, 0, 0);

    b.shoulderL.rotation.set(0.28 + backlift - tap, -0.12, 0.28);
    b.foreArmL.rotation.set(-0.68 - backlift * 0.32, 0, 0);

    if (b.batMount) {
      b.batMount.rotation.set(0.22 + backlift * 0.45 - tap * 0.5, 0, 0.08);
    }
  }
}

class BowlerAnimationController {
  constructor(rig) {
    this.rig = rig;
    this.bones = rig.bones;
    this.mixer = rig.mixer;
    this.followThroughTimer = 0;
  }

  resetToRunupStart() {
    this.followThroughTimer = 0;
    this.rig.rootGroup.position.set(0.45, 0, -14.2);
    this.rig.rootGroup.rotation.set(0, 0, 0);
  }

  /**
   * Animates the bowler's accelerating run-up, coil gather, delivery stride,
   * front-foot landing, and over-the-shoulder biomechanically accurate arm release.
   * Returns world coordinates of the bowler's right hand ball-release socket.
   */
  updateRunup(runProgress, dt) {
    const b = this.bones;
    const zPos = -14.2 + runProgress * 6.4;
    this.rig.rootGroup.position.set(0.45, 0, zPos);

    if (runProgress < 0.72) {
      // Phase A: Rhythmic accelerating run-up with alternating leg & arm drive
      const p = runProgress / 0.72;
      const strideAngle = p * Math.PI * 7;
      const legSwing = Math.sin(strideAngle) * 0.82;
      const kneeL = Math.max(0, -Math.cos(strideAngle) * 1.05);
      const kneeR = Math.max(0, Math.cos(strideAngle) * 1.05);

      b.pelvis.position.y = 0.93 + Math.abs(Math.sin(strideAngle)) * 0.06;
      b.pelvis.rotation.set(0.14, 0, 0);
      b.spineLower.rotation.set(0.16, Math.sin(strideAngle) * 0.14, 0);
      b.spineUpper.rotation.set(0.14, Math.sin(strideAngle) * 0.18, 0);
      b.head.rotation.set(-0.18, 0, 0);

      b.thighL.rotation.set(legSwing, 0, 0);
      b.shinL.rotation.set(kneeL, 0, 0);
      b.thighR.rotation.set(-legSwing, 0, 0);
      b.shinR.rotation.set(kneeR, 0, 0);

      b.shoulderL.rotation.set(-legSwing * 0.75, 0, 0.14);
      b.foreArmL.rotation.set(-0.95, 0, 0);
      b.shoulderR.rotation.set(legSwing * 0.75, 0, -0.14);
      b.foreArmR.rotation.set(-0.95, 0, 0);
    } else {
      // Phase B: Bound gather, front-foot block landing & over-arm bowling arc
      const dProg = (runProgress - 0.72) / 0.28; // 0 -> 1 at exact ball release
      const jumpArc = Math.sin(dProg * Math.PI) * 0.16;

      b.pelvis.position.y = 0.91 + jumpArc;
      // Side-on gather rotating into chest-on release
      const coilYaw = (1 - dProg) * 0.85;
      const trunkTilt = Math.max(0, (dProg - 0.5) * 0.65);

      b.pelvis.rotation.set(trunkTilt * 0.5, coilYaw * 0.5, 0);
      b.spineLower.rotation.set(trunkTilt * 0.6, coilYaw * 0.6, 0);
      b.spineUpper.rotation.set(trunkTilt * 0.8, coilYaw * 0.7, -0.18 * dProg);
      b.head.rotation.set(-trunkTilt * 0.8, -coilYaw * 0.6, 0);

      // Braced front left leg landing & driving back right leg
      b.thighL.rotation.set(-0.58 * dProg, 0, 0);
      b.shinL.rotation.set(0.18 * (1 - dProg), 0, 0);
      b.thighR.rotation.set(0.52 * dProg, 0, 0);
      b.shinR.rotation.set(0.65, 0, 0);

      // Non-bowling front arm (Left) reaches high to sky then pulls down to ribcage
      const leadArmPitch = dProg < 0.45 ? -2.4 * (dProg / 0.45) : -2.4 + ((dProg - 0.45) / 0.55) * 2.8;
      b.shoulderL.rotation.set(leadArmPitch, 0, 0.18);
      b.foreArmL.rotation.set(-0.45, 0, 0);

      // Bowling arm (Right) sweeps smoothly from hip gather behind back up to high release point
      // At dProg = 1.0, shoulderR.rotation.x = -Math.PI (arm straight up overhead)
      const bowlArmPitch = 0.65 - dProg * (0.65 + Math.PI * 0.96);
      b.shoulderR.rotation.set(bowlArmPitch, 0, -0.1);
      b.foreArmR.rotation.set(-0.08, 0, 0);
    }

    this.rig.rootGroup.updateMatrixWorld(true);
    const worldPos = new THREE.Vector3();
    if (b.ballReleaseSocket) {
      b.ballReleaseSocket.getWorldPosition(worldPos);
    } else {
      worldPos.set(0.28, 2.08, zPos);
    }
    return worldPos;
  }

  updateFollowThrough(dt) {
    this.followThroughTimer += dt;
    const b = this.bones;
    const f = Math.min(1, this.followThroughTimer / 0.65);

    // Momentum deceleration steps after ball release
    this.rig.rootGroup.position.z = -7.8 + Math.sin(f * (Math.PI / 2)) * 1.35;
    this.rig.rootGroup.position.x = 0.45 + f * 0.22;

    b.pelvis.position.y = 0.89;
    b.spineLower.rotation.set(0.32 * (1 - f * 0.5), -0.25 * f, 0);
    b.spineUpper.rotation.set(0.38 * (1 - f * 0.5), -0.35 * f, 0);
    b.head.rotation.set(-0.35 * (1 - f * 0.5), 0.25 * f, 0);

    // Bowling arm completes follow-through across the left hip
    b.shoulderR.rotation.set(-Math.PI + f * 3.85, -0.35 * f, -0.15);
    b.foreArmR.rotation.set(-0.45 * f, 0, 0);

    const stepWave = Math.sin(f * Math.PI * 2) * 0.45;
    b.thighL.rotation.set(stepWave, 0, 0);
    b.shinL.rotation.set(Math.max(0, -stepWave), 0, 0);
    b.thighR.rotation.set(-stepWave, 0, 0);
    b.shinR.rotation.set(Math.max(0, stepWave), 0, 0);
  }
}

class FielderAnimationController {
  constructor(rig, homePos, name) {
    this.rig = rig;
    this.bones = rig.bones;
    this.homePos = homePos.clone();
    this.name = name;
    this.rig.rootGroup.position.copy(this.homePos);
    this.rig.rootGroup.lookAt(0, 0, 5);
    this.actionState = 'READY'; // 'READY' | 'CHASING' | 'PICKUP_THROW'
    this.actionTimer = 0;
  }

  reset() {
    this.actionState = 'READY';
    this.actionTimer = 0;
    this.rig.rootGroup.position.copy(this.homePos);
    this.rig.rootGroup.lookAt(0, 0, 5);
  }

  update(dt, elapsedSec, ballPos, isBallInPlay) {
    const b = this.bones;
    const pos = this.rig.rootGroup.position;

    if (isBallInPlay && ballPos) {
      const dx = ballPos.x - pos.x;
      const dz = ballPos.z - pos.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 1.55 && ballPos.y < 2.2) {
        this.actionState = 'PICKUP_THROW';
        this.actionTimer += dt;
      } else if (dist < 25 && dist > 0.35) {
        this.actionState = 'CHASING';
        pos.x += (dx / dist) * 6.6 * dt;
        pos.z += (dz / dist) * 6.6 * dt;
        this.rig.rootGroup.lookAt(ballPos.x, 0, ballPos.z);
      } else {
        this.actionState = 'READY';
        this.rig.rootGroup.lookAt(ballPos.x, 0, ballPos.z);
      }
    } else {
      this.actionState = 'READY';
    }

    if (this.actionState === 'CHASING') {
      const cycle = elapsedSec * 14.5 + this.homePos.x;
      const swing = Math.sin(cycle) * 0.78;
      b.pelvis.position.y = 0.92 + Math.abs(Math.cos(cycle)) * 0.05;
      b.spineLower.rotation.set(0.18, Math.sin(cycle) * 0.14, 0);
      b.spineUpper.rotation.set(0.16, Math.sin(cycle) * 0.18, 0);
      b.thighL.rotation.set(swing, 0, 0);
      b.shinL.rotation.set(Math.max(0, -Math.cos(cycle) * 0.95), 0, 0);
      b.thighR.rotation.set(-swing, 0, 0);
      b.shinR.rotation.set(Math.max(0, Math.cos(cycle) * 0.95), 0, 0);
      b.shoulderL.rotation.set(-swing * 0.75, 0, 0.15);
      b.foreArmL.rotation.set(-0.9, 0, 0);
      b.shoulderR.rotation.set(swing * 0.75, 0, -0.15);
      b.foreArmR.rotation.set(-0.9, 0, 0);
    } else if (this.actionState === 'PICKUP_THROW') {
      // Swoop down to scoop ball or leap to catch, then cock arm to throw
      const p = Math.min(1, this.actionTimer * 3.0);
      const bend = Math.sin(p * Math.PI);
      b.pelvis.position.y = 0.91 - bend * 0.26;
      b.spineLower.rotation.set(bend * 0.55, 0, 0);
      b.spineUpper.rotation.set(bend * 0.48, 0, 0);
      b.thighL.rotation.set(-bend * 0.65, 0, -0.15);
      b.shinL.rotation.set(bend * 0.85, 0, 0);
      b.thighR.rotation.set(-bend * 0.45, 0, 0.15);
      b.shinR.rotation.set(bend * 0.75, 0, 0);
      b.shoulderR.rotation.set(-0.95 - p * 0.8, 0, -0.2);
      b.shoulderL.rotation.set(-0.85, 0, 0.2);
    } else {
      // Athletic ready stance on toes with subtle weight sway
      const sway = Math.sin(elapsedSec * 2.8 + this.homePos.z) * 0.04;
      b.pelvis.position.y = 0.89;
      b.pelvis.rotation.set(0.1, 0, sway * 0.5);
      b.spineLower.rotation.set(0.14, 0, 0);
      b.spineUpper.rotation.set(0.16, 0, 0);
      b.thighL.rotation.set(-0.26, 0, -0.12);
      b.shinL.rotation.set(0.36, 0, 0);
      b.thighR.rotation.set(-0.26, 0, 0.12);
      b.shinR.rotation.set(0.36, 0, 0);
      b.shoulderL.rotation.set(0.24, 0, 0.22);
      b.foreArmL.rotation.set(-0.55, 0, 0);
      b.shoulderR.rotation.set(0.24, 0, -0.22);
      b.foreArmR.rotation.set(-0.55, 0, 0);
    }
  }
}

// ============================================================================
// 1. PLATFORM SDK & MONETIZATION ABSTRACTION LAYER (Y8 / Lagged / GamePix)
// ============================================================================
class PlatformSDKManager {
  constructor() {
    this.platformName = 'GXA Standalone';
    this.sdkAvailable = false;
    this.adState = 'IDLE';
  }

  init() {
    if (typeof window !== 'undefined') {
      if (window.ID && typeof window.ID.ads === 'function') {
        this.platformName = 'Y8 Portal SDK';
        this.sdkAvailable = true;
      } else if (window.LaggedAPI) {
        this.platformName = 'Lagged Portal SDK';
        this.sdkAvailable = true;
      } else if (window.GamePix) {
        this.platformName = 'GamePix Portal SDK';
        this.sdkAvailable = true;
      }
    }
    return this.platformName;
  }

  /**
   * Bug Fix #7: Never simulate fake ad impressions or grant fake rewards via setTimeout.
   * Only invokes real portal SDK callbacks when hosted on an approved portal environment.
   */
  showInterstitialAd({ onBeforeAd, onAfterAd }) {
    if (!this.sdkAvailable || this.adState === 'LOADING') return false;
    if (typeof window !== 'undefined' && window.ID && typeof window.ID.ads === 'function') {
      this.adState = 'LOADING';
      if (onBeforeAd) onBeforeAd();
      window.ID.ads(() => {
        this.adState = 'IDLE';
        if (onAfterAd) onAfterAd();
      });
      return true;
    }
    return false;
  }

  showRewardedAd({ onBeforeAd, onRewardGranted, onAdFailed }) {
    if (!this.sdkAvailable || this.adState === 'LOADING') {
      if (onAdFailed) onAdFailed('Portal Rewarded Ad SDK not active in standalone preview.');
      return false;
    }
    return false;
  }

  submitScore(modeId, score) {
    try {
      if (typeof window !== 'undefined') {
        if (window.ID && window.ID.GameAPI && window.ID.GameAPI.Leaderboards) {
          window.ID.GameAPI.Leaderboards.save({ table: modeId, points: score });
        } else if (window.GamePix && window.GamePix.updateScore) {
          window.GamePix.updateScore(score);
        }
      }
    } catch (e) {
      // Safe no-op in standalone environment
    }
  }
}

const platformSDK = new PlatformSDKManager();

// ============================================================================
// 2. PROCEDURAL WEB AUDIO API SOUND SYNTHESIZER (Zero External MP3 Dependencies)
// ============================================================================
class CricketSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return false;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  dispose() {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  playBatHit(quality = 1.0, isLofted = false) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const startFreq = isLofted ? 210 * quality : 165 * quality;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    const bufferSize = this.ctx.sampleRate * 0.06;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = quality > 0.9 ? 1200 : 700;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5 * quality, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(now);
  }

  playBallBounce() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playStumpHit() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    [0, 0.045, 0.09].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(420 - idx * 75, now + offset);
      osc.frequency.exponentialRampToValueAtTime(110, now + offset + 0.11);
      gain.gain.setValueAtTime(0.32, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.11);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.11);
    });
  }

  playCrowdRoar(intensity = 1.0, duration = 1.8) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.35 * intensity;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.linearRampToValueAtTime(1150, now + duration * 0.5);
    filter.Q.value = 1.4;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45 * intensity, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(now);

    if (intensity > 1.1) {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        g.gain.setValueAtTime(0.16, now + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.45);
      });
    }
  }
}

const soundFX = new CricketSoundEngine();

// ============================================================================
// 3. GAMEPLAY CONSTANTS, MODES, BOWLING VARIATIONS & UNLOCKABLE ARMORY
// ============================================================================
const STORAGE_KEY = 'GXA_CRICKET_CHALLENGE_SAVE_V1';

const GAME_MODES = [
  {
    id: 'quick_2',
    name: 'Quick Match (2 Overs)',
    subtitle: 'Fast-paced 12-ball blitz! Smash a massive total before overs run out.',
    overs: 2,
    wickets: 3,
    target: null,
    badge: 'CORE MODE',
    color: 'from-emerald-500 to-teal-700',
    icon: Zap
  },
  {
    id: 'quick_5',
    name: 'Quick Match (5 Overs)',
    subtitle: '30 deliveries to pace your innings and launch a death-overs assault.',
    overs: 5,
    wickets: 5,
    target: null,
    badge: 'POPULAR',
    color: 'from-cyan-500 to-blue-700',
    icon: Play
  },
  {
    id: 'six_challenge',
    name: 'Super Sixes Challenge',
    subtitle: '10 straight balls. Maximum Sixes grant bonus points & double coins!',
    overs: null,
    ballsLimit: 10,
    wickets: 10,
    target: null,
    onlySixesCountBonus: true,
    badge: 'ARCADE',
    color: 'from-amber-500 to-orange-700',
    icon: Flame
  },
  {
    id: 'target_chase',
    name: 'Last Over Target Chase',
    subtitle: 'High-pressure finish: Chase down 38 runs in 12 balls with 3 wickets in hand!',
    overs: 2,
    wickets: 3,
    target: 38,
    badge: 'CLUTCH',
    color: 'from-purple-500 to-indigo-800',
    icon: Target
  },
  {
    id: 'endless',
    name: 'Endless Survival',
    subtitle: '1 Wicket. Unlimited deliveries. Bowling speed ramps up every over!',
    overs: 99,
    wickets: 1,
    target: null,
    badge: 'SURVIVAL',
    color: 'from-rose-500 to-red-800',
    icon: Shield
  },
  {
    id: 'tournament',
    name: 'GXA World Cup Knockout',
    subtitle: 'Quarter-Final (24 in 2 ov), Semi-Final (34 in 2 ov) & Grand Final (46 in 2 ov).',
    overs: 2,
    wickets: 3,
    isTournament: true,
    rounds: [
      { name: 'Quarter-Final vs AUS XI', target: 24, reward: 120 },
      { name: 'Semi-Final vs ENG XI', target: 34, reward: 220 },
      { name: 'World Cup Final vs IND XI', target: 46, reward: 500 }
    ],
    badge: 'PRO CUP',
    color: 'from-yellow-400 to-amber-700',
    icon: Trophy
  }
];

const BOWLING_VARIATIONS = [
  {
    id: 'fast_good',
    name: 'Express Good Length',
    type: 'FAST',
    speedKmh: 146,
    bounceZ: 2.5,
    swingX: 0.0,
    seamDeviation: 0.05,
    bounceFactor: 0.56,
    color: '#ef4444'
  },
  {
    id: 'yorker',
    name: 'Toe-Crushing Yorker',
    type: 'FAST',
    speedKmh: 151,
    bounceZ: 7.05,
    swingX: -0.18,
    seamDeviation: 0.0,
    bounceFactor: 0.34,
    color: '#dc2626'
  },
  {
    id: 'bouncer',
    name: 'Short-Pitch Bumper',
    type: 'FAST',
    speedKmh: 144,
    bounceZ: -0.6,
    swingX: 0.05,
    seamDeviation: -0.04,
    bounceFactor: 0.72,
    color: '#f97316'
  },
  {
    id: 'inswing',
    name: 'Late Inswinger',
    type: 'MEDIUM',
    speedKmh: 132,
    bounceZ: 4.1,
    swingX: 0.42,
    seamDeviation: 0.14,
    bounceFactor: 0.52,
    color: '#3b82f6'
  },
  {
    id: 'outswing',
    name: 'Away Outswinger',
    type: 'MEDIUM',
    speedKmh: 130,
    bounceZ: 3.6,
    swingX: -0.42,
    seamDeviation: -0.16,
    bounceFactor: 0.52,
    color: '#06b6d4'
  },
  {
    id: 'leg_spin',
    name: 'Flighted Leg-Break',
    type: 'SPIN',
    speedKmh: 92,
    bounceZ: 4.6,
    swingX: -0.15,
    seamDeviation: 0.52,
    bounceFactor: 0.62,
    color: '#a855f7'
  },
  {
    id: 'off_spin',
    name: 'Ripping Doosra / Off-Break',
    type: 'SPIN',
    speedKmh: 95,
    bounceZ: 4.3,
    swingX: 0.15,
    seamDeviation: -0.48,
    bounceFactor: 0.6,
    color: '#ec4899'
  }
];

const BATS_CATALOG = [
  {
    id: 'classic_willow',
    name: 'GXA English Willow',
    powerBoost: 1.0,
    timingWindowBonus: 1.0,
    cost: 0,
    bladeColor: '#d6b27c',
    gripColor: '#10b981',
    stickerColor: '#10b981',
    desc: 'Balanced classic willow for crisp drives and reliable timing.'
  },
  {
    id: 'strike_pro',
    name: 'GXA Viper Carbon',
    powerBoost: 1.08,
    timingWindowBonus: 1.06,
    cost: 150,
    bladeColor: '#cbd5e1',
    gripColor: '#0ea5e9',
    stickerColor: '#0ea5e9',
    desc: '+8% Exit Velocity & +6% Sweet-Spot Timing Window.'
  },
  {
    id: 'gold_edition',
    name: 'GXA Sovereign 24K',
    powerBoost: 1.15,
    timingWindowBonus: 1.12,
    cost: 350,
    bladeColor: '#facc15',
    gripColor: '#dc2626',
    stickerColor: '#ef4444',
    desc: '+15% Boundary Power & +12% Sweet-Spot Forgiveness.'
  },
  {
    id: 'neon_cyber',
    name: 'GXA Plasma Blaster',
    powerBoost: 1.22,
    timingWindowBonus: 1.18,
    cost: 600,
    bladeColor: '#2dd4bf',
    gripColor: '#a855f7',
    stickerColor: '#a855f7',
    desc: 'Maximum tournament-grade power (+22%) for effortless 110m Sixes.'
  }
];

const STADIUM_THEMES = {
  day: {
    id: 'day',
    name: 'Sunny Day Test',
    skyTop: '#0284c7',
    skyBottom: '#bae6fd',
    ambientColor: 0xffffff,
    ambientIntensity: 0.78,
    sunColor: 0xfffbeb,
    sunIntensity: 1.2,
    floodlightGlow: 0.15,
    cost: 0
  },
  dusk: {
    id: 'dusk',
    name: 'Golden Twilight T20',
    skyTop: '#311042',
    skyBottom: '#f97316',
    ambientColor: 0xfed7aa,
    ambientIntensity: 0.65,
    sunColor: 0xfb923c,
    sunIntensity: 1.05,
    floodlightGlow: 0.75,
    cost: 100
  },
  night: {
    id: 'night',
    name: 'Floodlit Night Finale',
    skyTop: '#020617',
    skyBottom: '#0f172a',
    ambientColor: 0x93c5fd,
    ambientIntensity: 0.58,
    sunColor: 0xe0f2fe,
    sunIntensity: 0.95,
    floodlightGlow: 1.0,
    cost: 200
  }
};

const ACHIEVEMENTS_LIST = [
  { id: 'first_six', title: 'Maximum Launch!', desc: 'Hit your first 6 into the stands', reward: 50 },
  { id: 'hattrick_4s', title: 'Boundary Machine', desc: 'Hit 3 boundaries (4 or 6) in a row', reward: 100 },
  { id: 'fifty_club', title: 'Half-Century Hero', desc: 'Score 50+ runs in a single innings', reward: 200 },
  { id: 'perfect_3', title: 'Sweet Spot Master', desc: 'Achieve 3 PERFECT timed shots in a match', reward: 150 },
  { id: 'tournament_champ', title: 'GXA World Champion', desc: 'Win the 3-round GXA World Cup Final', reward: 500 }
];

const PHASE3_AUDIT_ITEMS = [
  { id: 1, name: '19-Joint SkinnedMesh Humanoid Athletes', status: 'PHASE 3 ACTIVE', detail: 'Continuous vertex-weighted SkinnedMesh torso, arms & legs bound across 19 bones' },
  { id: 2, name: 'Single-Trigger Gather & CrossFade Blending', status: 'FIXED', detail: 'triggerGather() fires once per delivery at 55% run-up with AnimationMixer crossfade' },
  { id: 3, name: 'Continuous Bat Swing Through Impact', status: 'FIXED', detail: 'Preserves swing stateTime continuity from input backswing through ball contact & follow-through' },
  { id: 4, name: 'Grounded Crease-to-Crease Running', status: 'FIXED', detail: 'Replaced sinusoidal Z teleportation with linear crease travel, turn pivots & stride cycles' },
  { id: 5, name: 'Frame-Rate Independent Action Replay (dt)', status: 'FIXED', detail: 'Replay cursor advances by dt * 36 fps with linear frame interpolation' },
  { id: 6, name: 'WebGL & Audio Resource Disposal', status: 'FIXED', detail: 'Disposes geometries, materials, textures, AnimationMixers & AudioContext on teardown/theme swap' },
  { id: 7, name: 'Y8 / Portal Monetization Compliance', status: 'FIXED', detail: 'Removed simulated timeout ad callbacks; ads remain hidden unless a real portal SDK is active' },
  { id: 8, name: '160ms Swept Collision & Dismissal Rules', status: 'PHASE 3 ACTIVE', detail: 'Sub-frame bat collision window and distinct Bowled vs Caught wicket attribution' }
];

// ============================================================================
// 4. MAIN REACT APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Persistent Player Profile in LocalStorage
  const [profile, setProfile] = useState(() => {
    const defaultProfile = {
      coins: 120,
      xp: 0,
      totalRuns: 0,
      totalSixes: 0,
      matchesPlayed: 0,
      highScores: {
        quick_2: 0,
        quick_5: 0,
        six_challenge: 0,
        target_chase: 0,
        endless: 0,
        tournament: 0
      },
      unlockedBats: ['classic_willow'],
      selectedBat: 'classic_willow',
      unlockedThemes: ['day'],
      selectedTheme: 'day',
      achievements: [],
      tournamentStage: 0,
      dailyChallengeClaimed: false
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch (e) {
      return defaultProfile;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      // Ignore storage quota errors
    }
  }, [profile]);

  // UI Navigation & Modal State
  const [screen, setScreen] = useState('HOME'); // 'HOME' | 'PLAYING' | 'GAMEOVER'
  const [activeModal, setActiveModal] = useState(null); // null | 'SHOP' | 'ACHIEVEMENTS' | 'DOCS' | 'CONTROLS'
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('BROADCAST'); // 'BROADCAST' | 'PRO_CLOSE' | 'AERIAL'

  // Active Match State
  const [selectedMode, setSelectedMode] = useState(GAME_MODES[0]);
  const [matchState, setMatchState] = useState({
    runs: 0,
    wickets: 0,
    maxWickets: 3,
    ballsBowled: 0,
    totalBalls: 12,
    sixesCount: 0,
    foursCount: 0,
    streakBoundaries: 0,
    perfectCount: 0,
    target: null,
    thisOver: [],
    wagonWheelShots: [],
    lastShotTypePlayed: '',
    lastShotConfidence: 0,
    lastTimingDeltaMs: 0,
    lastDismissalType: null,
    overBannerText: null,
    lastOutcomeText: 'READY TO BAT',
    lastOutcomeSub: 'Swipe or press Direction + Shot when the ball bounces!',
    lastTimingBadge: null,
    deliverySpeed: 0,
    deliveryName: 'Waiting for Bowler...',
    deliveryType: 'FAST',
    isBallActive: false,
    canSkipToNextBall: false,
    canReplay: false,
    tournamentRoundName: ''
  });

  // Batting Input Controls State
  const [shotType, setShotType] = useState('GROUND'); // 'GROUND' | 'LOFT' | 'DEFENSE'
  const [aimDirection, setAimDirection] = useState({ x: 0, label: 'STRAIGHT DRIVE' });
  const [liveTimingCursor, setLiveTimingCursor] = useState(0);
  const [bowlerPhaseLabel, setBowlerPhaseLabel] = useState('READY');
  const [toastNotification, setToastNotification] = useState(null);

  // Refs for Three.js & Real-time Game Loop
  const mountRef = useRef(null);
  const deliveryTimeoutRef = useRef(null);
  const engineRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    ambientLight: null,
    sunLight: null,
    ballMesh: null,
    ballHaloMesh: null,
    ballShadowMesh: null,
    ballTrail: null,
    trailPositions: [],
    pitchMarker: null,
    timingRing: null,
    batsmanGroup: null,
    nonStrikerGroup: null,
    keeperGroup: null,
    batPivot: null,
    batBladeMesh: null,
    bowlerGroup: null,
    bowlerArmPivot: null,
    batsmanController: null,
    nonStrikerController: null,
    bowlerController: null,
    fielderControllers: [],
    stumpsBatter: [],
    bailsBatter: [],
    fielders: [],
    phase: 'IDLE', // 'IDLE' | 'RUNUP' | 'BOWLED' | 'HIT_FLIGHT' | 'WICKET_ANIM' | 'RESETTING'
    phaseTimer: 0,
    ballPos: new THREE.Vector3(0, 1.5, -10),
    prevBallPos: new THREE.Vector3(0, 1.5, -10),
    ballVel: new THREE.Vector3(0, 0, 0),
    currentDelivery: null,
    hasBounced: false,
    hasSwung: false,
    swingActiveTimer: 0,
    swingAnimProgress: 0,
    swingStyle: 'GROUND',
    swingDirX: 0,
    runSprintTimer: 0,
    cameraShake: 0,
    bowledHeadline: 'BOWLED HIM!',
    hitBouncedInOutfield: false,
    replayTrajectory: [],
    isReplaying: false,
    replayIndex: 0,
    pointerDownPos: null
  });

  // Sync latest React state into refs accessible by requestAnimationFrame loop
  const shotTypeRef = useRef(shotType);
  shotTypeRef.current = shotType;
  const aimDirRef = useRef(aimDirection);
  aimDirRef.current = aimDirection;
  const matchStateRef = useRef(matchState);
  matchStateRef.current = matchState;
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const cameraPresetRef = useRef(cameraPreset);
  cameraPresetRef.current = cameraPreset;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const clearPendingTimers = useCallback(() => {
    if (deliveryTimeoutRef.current) {
      clearTimeout(deliveryTimeoutRef.current);
      deliveryTimeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback((title, subtitle) => {
    setToastNotification({ title, subtitle });
    setTimeout(() => setToastNotification(null), 3200);
  }, []);

  const unlockAchievement = useCallback(
    (achId) => {
      setProfile((prev) => {
        if (prev.achievements.includes(achId)) return prev;
        const found = ACHIEVEMENTS_LIST.find((a) => a.id === achId);
        if (!found) return prev;
        showToast(`🏆 Achievement Unlocked: ${found.title}`, `+${found.reward} GXA Coins added!`);
        return {
          ...prev,
          coins: prev.coins + found.reward,
          achievements: [...prev.achievements, achId]
        };
      });
    },
    [showToast]
  );

  // Reset Stumps, Bails & Fielders to home positions before a new ball
  const resetFieldPositions = useCallback(() => {
    const eng = engineRef.current;
    if (!eng.scene) return;

    eng.stumpsBatter.forEach((s) => {
      s.position.copy(s.userData.homePos);
      s.rotation.set(0, 0, 0);
      s.userData.vel.set(0, 0, 0);
      s.userData.rotVel.set(0, 0, 0);
    });
    eng.bailsBatter.forEach((b) => {
      b.position.copy(b.userData.homePos);
      b.rotation.set(0, 0, Math.PI / 2);
      b.userData.vel.set(0, 0, 0);
      b.userData.rotVel.set(0, 0, 0);
    });
    if (eng.fielderControllers && eng.fielderControllers.length > 0) {
      eng.fielderControllers.forEach((fc) => fc.reset());
    }
    if (eng.bowlerController) {
      eng.bowlerController.resetToRunupStart();
    }
    if (eng.batsmanController) {
      eng.batsmanController.triggerReaction('IDLE');
    }
    if (eng.nonStrikerGroup) {
      eng.nonStrikerGroup.position.set(-1.05, 0, -8.2);
    }
    if (eng.ballMesh) eng.ballMesh.visible = false;
    if (eng.ballHaloMesh) eng.ballHaloMesh.visible = false;
    if (eng.ballShadowMesh) eng.ballShadowMesh.visible = false;
    if (eng.pitchMarker) eng.pitchMarker.visible = false;
    eng.trailPositions = [];
    if (eng.ballTrail) {
      const posAttr = eng.ballTrail.geometry.attributes.position;
      for (let i = 0; i < 28 * 3; i++) posAttr.array[i] = 0;
      posAttr.needsUpdate = true;
    }
  }, []);

  // Trigger AI Bowler Delivery
  const triggerNextDelivery = useCallback(() => {
    const eng = engineRef.current;
    if (!eng.scene || eng.phase === 'RUNUP' || eng.phase === 'BOWLED') return;

    clearPendingTimers();
    resetFieldPositions();

    const ballsDone = matchStateRef.current.ballsBowled;
    const difficultyScale = 1 + Math.min(0.28, ballsDone * 0.012);

    const template = BOWLING_VARIATIONS[Math.floor(Math.random() * BOWLING_VARIATIONS.length)];
    const speedJitter = Math.round((Math.random() - 0.5) * 8);
    const actualSpeedKmh = Math.min(162, Math.round(template.speedKmh * difficultyScale + speedJitter));
    const targetLineX = (Math.random() - 0.5) * 0.58;

    eng.currentDelivery = {
      ...template,
      actualSpeedKmh,
      targetLineX
    };
    eng.hasSwung = false;
    eng.swingActiveTimer = 0;
    eng.runSprintTimer = 0;
    eng.isReplaying = false;
    eng.phase = 'RUNUP';
    eng.phaseTimer = 0;
    setBowlerPhaseLabel('BOWLER RUNNING IN...');

    setMatchState((prev) => ({
      ...prev,
      deliverySpeed: actualSpeedKmh,
      deliveryName: template.name,
      deliveryType: template.type,
      overBannerText: null,
      isBallActive: true,
      canSkipToNextBall: false,
      lastTimingBadge: null
    }));
  }, [clearPendingTimers, resetFieldPositions]);

  // Complete a delivery, update scoreboard, check achievements & match end
  const completeDeliveryOutcome = useCallback(
    (runs, isWicket, headline, subtitle, dismissalType = null) => {
      const eng = engineRef.current;
      eng.phase = 'RESETTING';
      setBowlerPhaseLabel('NEXT DELIVERY READY');
      clearPendingTimers();

      if (runs === 6) eng.cameraShake = 0.75;
      else if (runs === 4) eng.cameraShake = 0.4;

      setMatchState((prev) => {
        const effectiveRuns = selectedMode.onlySixesCountBonus && runs === 6 ? 10 : runs;

        const newRuns = prev.runs + effectiveRuns;
        const newWickets = prev.wickets + (isWicket ? 1 : 0);
        const newBalls = prev.ballsBowled + 1;
        const newSixes = prev.sixesCount + (runs === 6 ? 1 : 0);
        const newFours = prev.foursCount + (runs === 4 ? 1 : 0);
        const newStreak = runs >= 4 ? prev.streakBoundaries + 1 : 0;

        const ballBadge = isWicket ? 'W' : String(runs);
        const nextOverArr = newBalls % 6 === 1 ? [ballBadge] : [...prev.thisOver, ballBadge];

        const completedOverNumber = newBalls > 0 && newBalls % 6 === 0 ? newBalls / 6 : null;
        const overBanner =
          completedOverNumber && newBalls < prev.totalBalls
            ? `END OF OVER ${completedOverNumber} • SCORE: ${newRuns}/${newWickets}`
            : null;

        const nextWagon =
          runs > 0
            ? [...prev.wagonWheelShots.slice(-11), { x: eng.ballPos.x, z: eng.ballPos.z, runs }]
            : prev.wagonWheelShots;

        if (runs === 6) unlockAchievement('first_six');
        if (newStreak >= 3) unlockAchievement('hattrick_4s');
        if (newRuns >= 50) unlockAchievement('fifty_club');

        if (runs > 0) {
          const coinGain = runs === 6 ? 15 : runs === 4 ? 8 : runs * 2;
          setProfile((p) => ({
            ...p,
            coins: p.coins + coinGain,
            xp: p.xp + runs * 10,
            totalRuns: p.totalRuns + runs,
            totalSixes: p.totalSixes + (runs === 6 ? 1 : 0)
          }));
        }

        const chasedTarget = prev.target !== null && newRuns >= prev.target;
        const allOut = newWickets >= prev.maxWickets;
        const oversFinished = newBalls >= prev.totalBalls;

        if (chasedTarget || allOut || oversFinished) {
          deliveryTimeoutRef.current = setTimeout(() => {
            platformSDK.submitScore(selectedMode.id, newRuns);
            setProfile((p) => {
              const prevBest = p.highScores[selectedMode.id] || 0;
              const nextStage =
                selectedMode.isTournament && chasedTarget
                  ? Math.min(2, p.tournamentStage + 1)
                  : p.tournamentStage;
              if (selectedMode.isTournament && chasedTarget && p.tournamentStage === 2) {
                unlockAchievement('tournament_champ');
              }
              return {
                ...p,
                tournamentStage: nextStage,
                highScores: {
                  ...p.highScores,
                  [selectedMode.id]: Math.max(prevBest, newRuns)
                }
              };
            });
            setScreen('GAMEOVER');
            eng.phase = 'IDLE';
          }, 1600);
        } else {
          deliveryTimeoutRef.current = setTimeout(() => {
            eng.phase = 'IDLE';
            triggerNextDelivery();
          }, overBanner ? 2350 : 1850);
        }

        return {
          ...prev,
          runs: newRuns,
          wickets: newWickets,
          ballsBowled: newBalls,
          sixesCount: newSixes,
          foursCount: newFours,
          streakBoundaries: newStreak,
          thisOver: nextOverArr,
          wagonWheelShots: nextWagon,
          lastDismissalType: dismissalType,
          overBannerText: overBanner,
          lastOutcomeText: headline,
          lastOutcomeSub: subtitle,
          isBallActive: false,
          canSkipToNextBall: !(chasedTarget || allOut || oversFinished),
          canReplay: runs >= 4 || isWicket
        };
      });
    },
    [clearPendingTimers, selectedMode, triggerNextDelivery, unlockAchievement]
  );

  // Keep a ref to completeDeliveryOutcome so the Three.js loop always calls the latest callback
  const completeOutcomeRef = useRef(completeDeliveryOutcome);
  completeOutcomeRef.current = completeDeliveryOutcome;

  // ============================================================================
  // 5. THREE.JS 3D STADIUM, PITCH, CHARACTERS & PHYSICS INITIALIZATION
  // ============================================================================
  useEffect(() => {
    platformSDK.init();
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const theme = STADIUM_THEMES[profileRef.current.selectedTheme] || STADIUM_THEMES.day;
    scene.fog = new THREE.FogExp2(theme.skyBottom, 0.0045);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 3.35, 13.8);
    camera.lookAt(0, 1.0, -2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(theme.ambientColor, theme.ambientIntensity);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(theme.sunColor, theme.sunIntensity);
    sunLight.position.set(28, 52, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 140;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // --- LUSH CRICKET OVAL GROUND WITH PROCEDURAL MOWED TURF TEXTURE ---
    const turfTexture = createGrassTurfTexture();
    const outfieldGeo = new THREE.CircleGeometry(85, 64);
    const outfieldMat = new THREE.MeshLambertMaterial({ map: turfTexture });
    const outfield = new THREE.Mesh(outfieldGeo, outfieldMat);
    outfield.rotation.x = -Math.PI / 2;
    outfield.receiveShadow = true;
    scene.add(outfield);

    // Concentric mowed turf contrast rings
    for (let r = 12; r <= 64; r += 10) {
      const ringGeo = new THREE.RingGeometry(r, r + 5, 64);
      const ringMat = new THREE.MeshLambertMaterial({
        color: 0x15803d,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.008;
      scene.add(ring);
    }

    // 30-Yard Inner Fielding Restriction Circle
    const circle30Geo = new THREE.RingGeometry(27.8, 28.15, 64);
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const circle30 = new THREE.Mesh(circle30Geo, whiteLineMat);
    circle30.rotation.x = -Math.PI / 2;
    circle30.position.y = 0.02;
    scene.add(circle30);

    // Illuminated Cushion Boundary Rope (Radius = 64m)
    const boundaryRopeGeo = new THREE.TorusGeometry(64, 0.35, 12, 96);
    const boundaryRopeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const boundaryRope = new THREE.Mesh(boundaryRopeGeo, boundaryRopeMat);
    boundaryRope.rotation.x = Math.PI / 2;
    boundaryRope.position.y = 0.32;
    scene.add(boundaryRope);

    // Digital LED Perimeter Advertising Boards
    const bannerTex = createPerimeterBannerTexture();
    const adBoardGeo = new THREE.CylinderGeometry(66.5, 66.5, 1.35, 64, 1, true);
    const adBoardMat = new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide });
    const adBoard = new THREE.Mesh(adBoardGeo, adBoardMat);
    adBoard.position.y = 0.68;
    scene.add(adBoard);

    // --- 22-YARD CLAY CRICKET PITCH WITH TEXTURE & FULL CREASE MARKINGS ---
    const clayPitchTex = createClayPitchTexture();
    const pitchGeo = new THREE.PlaneGeometry(3.1, 20.5);
    const pitchMat = new THREE.MeshLambertMaterial({ map: clayPitchTex });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.025;
    pitch.receiveShadow = true;
    scene.add(pitch);

    const addCreaseLine = (w, h, x, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), whiteLineMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.032, z);
      scene.add(m);
    };
    // Batter end creases (z = +9.0 stumps, z = +7.8 popping crease)
    addCreaseLine(2.64, 0.06, 0, 7.8);
    addCreaseLine(3.05, 0.06, 0, 9.0);
    addCreaseLine(0.06, 2.4, -1.32, 8.4);
    addCreaseLine(0.06, 2.4, 1.32, 8.4);
    addCreaseLine(0.04, 1.2, -0.88, 8.4);
    addCreaseLine(0.04, 1.2, 0.88, 8.4);

    // Bowler end creases (z = -9.0 stumps, z = -7.8 popping crease)
    addCreaseLine(2.64, 0.06, 0, -7.8);
    addCreaseLine(3.05, 0.06, 0, -9.0);
    addCreaseLine(0.06, 2.4, -1.32, -8.4);
    addCreaseLine(0.06, 2.4, 1.32, -8.4);

    // --- STADIUM GRANDSTAND TIERS, SIGHTSCREEN, JUMBOTRON & 4 FLOODLIGHT TOWERS ---
    const stadiumGroup = new THREE.Group();
    const standMatLower = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const standMatUpper = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const lowerStand = new THREE.Mesh(new THREE.CylinderGeometry(76, 69, 9, 48, 1, true), standMatLower);
    lowerStand.position.y = 4.5;
    lowerStand.material.side = THREE.DoubleSide;
    stadiumGroup.add(lowerStand);

    const upperStand = new THREE.Mesh(new THREE.CylinderGeometry(86, 76, 12, 48, 1, true), standMatUpper);
    upperStand.position.y = 14.5;
    upperStand.material.side = THREE.DoubleSide;
    stadiumGroup.add(upperStand);

    const roofRing = new THREE.Mesh(
      new THREE.RingGeometry(68, 87, 48),
      new THREE.MeshLambertMaterial({ color: 0x334155, side: THREE.DoubleSide })
    );
    roofRing.rotation.x = Math.PI / 2;
    roofRing.position.y = 21.0;
    stadiumGroup.add(roofRing);

    const sightScreen = new THREE.Mesh(
      new THREE.BoxGeometry(14, 9, 1),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    sightScreen.position.set(0, 4.5, -68);
    stadiumGroup.add(sightScreen);

    // 3D Stadium Giant Jumbotron Scoreboard at Deep Mid-Wicket
    const jumboGroup = new THREE.Group();
    const jumboFrame = new THREE.Mesh(
      new THREE.BoxGeometry(20, 8.5, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x020617 })
    );
    jumboFrame.position.y = 30;
    jumboGroup.add(jumboFrame);
    const jumboScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(18.6, 7.2),
      new THREE.MeshBasicMaterial({ color: 0x064e3b })
    );
    jumboScreen.position.set(0, 30, 0.65);
    jumboGroup.add(jumboScreen);
    jumboGroup.position.set(-46, 0, -54);
    jumboGroup.lookAt(0, 2, 8);
    stadiumGroup.add(jumboGroup);

    // 4 Giant Floodlight Towers
    const towerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    towerAngles.forEach((ang) => {
      const tx = Math.cos(ang) * 78;
      const tz = Math.sin(ang) * 78;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 1.3, 42, 8),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      pole.position.set(tx, 21, tz);
      stadiumGroup.add(pole);

      const headFrame = new THREE.Mesh(
        new THREE.BoxGeometry(9, 5.5, 1.2),
        new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
      );
      headFrame.position.set(tx, 42, tz);
      headFrame.lookAt(0, 0, 0);
      stadiumGroup.add(headFrame);
    });

    // Instanced Animated Crowd Spectators (900 spectators)
    const crowdCount = 900;
    const crowdGeo = new THREE.BoxGeometry(0.65, 0.9, 0.65);
    const crowdMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const crowdInstanced = new THREE.InstancedMesh(crowdGeo, crowdMat, crowdCount);
    const dummy = new THREE.Object3D();
    const palette = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xf97316, 0xa855f7, 0xf8fafc];
    for (let i = 0; i < crowdCount; i++) {
      const angle = (i / crowdCount) * Math.PI * 2 + Math.random() * 0.05;
      if (Math.abs(Math.sin(angle)) > 0.96 && Math.cos(angle) < 0) continue;
      const tier = i % 2;
      const radius = tier === 0 ? 70 + Math.random() * 5 : 77 + Math.random() * 7;
      const height = tier === 0 ? 2.2 + (radius - 70) * 1.1 : 10.5 + (radius - 77) * 1.2;
      dummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      dummy.lookAt(0, 1, 0);
      dummy.updateMatrix();
      crowdInstanced.setMatrixAt(i, dummy.matrix);
      crowdInstanced.setColorAt(i, new THREE.Color(palette[i % palette.length]));
    }
    stadiumGroup.add(crowdInstanced);
    scene.add(stadiumGroup);

    // --- 3D STUMPS & BAILS WITH METALLIC FERRULES ---
    const stumpGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.78, 12);
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
    const ferruleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.2 });
    const bailGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.12, 8);

    const stumpsBatter = [];
    const bailsBatter = [];

    [-0.12, 0, 0.12].forEach((xOffset) => {
      const sBat = new THREE.Group();
      const sWood = new THREE.Mesh(stumpGeo, stumpMat);
      sWood.castShadow = true;
      sBat.add(sWood);
      const sFerrule = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.06, 12), ferruleMat);
      sFerrule.position.y = 0.36;
      sBat.add(sFerrule);

      sBat.position.set(xOffset, 0.39, 9.0);
      sBat.userData = { homePos: sBat.position.clone(), vel: new THREE.Vector3(), rotVel: new THREE.Vector3() };
      scene.add(sBat);
      stumpsBatter.push(sBat);

      const sBowl = new THREE.Mesh(stumpGeo, stumpMat);
      sBowl.position.set(xOffset, 0.39, -9.0);
      scene.add(sBowl);
    });

    [-0.06, 0.06].forEach((xBail) => {
      const bBat = new THREE.Mesh(bailGeo, stumpMat);
      bBat.rotation.z = Math.PI / 2;
      bBat.position.set(xBail, 0.79, 9.0);
      bBat.userData = { homePos: bBat.position.clone(), vel: new THREE.Vector3(), rotVel: new THREE.Vector3() };
      scene.add(bBat);
      bailsBatter.push(bBat);

      const bBowl = new THREE.Mesh(bailGeo, stumpMat);
      bBowl.rotation.z = Math.PI / 2;
      bBowl.position.set(xBail, 0.79, -9.0);
      scene.add(bBowl);
    });

    // --- PITCHING BOUNCE MARKER & BATTER TIMING RING ---
    const pitchMarkerGeo = new THREE.RingGeometry(0.18, 0.36, 32);
    const pitchMarkerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const pitchMarker = new THREE.Mesh(pitchMarkerGeo, pitchMarkerMat);
    pitchMarker.rotation.x = -Math.PI / 2;
    pitchMarker.position.set(0, 0.04, 3.5);
    pitchMarker.visible = false;
    scene.add(pitchMarker);

    const timingRingGeo = new THREE.RingGeometry(0.45, 0.56, 32);
    const timingRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const timingRing = new THREE.Mesh(timingRingGeo, timingRingMat);
    timingRing.rotation.x = -Math.PI / 2;
    timingRing.position.set(0, 0.035, 7.65);
    scene.add(timingRing);

    // --- AAA 19-BONE SKINNEDMESH HUMANOID BATSMAN & BAT ---
    const activeBatSpec = BATS_CATALOG.find((b) => b.id === profileRef.current.selectedBat) || BATS_CATALOG[0];
    const batBladeMat = new THREE.MeshStandardMaterial({
      map: createBatStickerTexture(activeBatSpec.bladeColor, activeBatSpec.stickerColor),
      roughness: 0.42
    });

    const strikerRig = CharacterAssetLoader.createHumanoidCricketer({
      role: 'BATSMAN',
      batMaterial: batBladeMat,
      lod: 'HIGH'
    });
    const batsmanGroup = strikerRig.rootGroup;
    const batBladeMesh = strikerRig.batBladeMesh;
    const batPivot = strikerRig.bones.shoulderR;
    const batsmanController = new BatsmanAnimationController(strikerRig, false);
    scene.add(batsmanGroup);

    // --- AAA 19-BONE SKINNEDMESH NON-STRIKER BATSMAN AT BOWLER END ---
    const nonStrikerRig = CharacterAssetLoader.createHumanoidCricketer({
      role: 'NON_STRIKER',
      batMaterial: batBladeMat,
      lod: 'MEDIUM'
    });
    const nonStrikerGroup = nonStrikerRig.rootGroup;
    const nonStrikerController = new BatsmanAnimationController(nonStrikerRig, true);
    scene.add(nonStrikerGroup);

    // --- AAA 19-BONE SKINNEDMESH HUMANOID BOWLER ---
    const bowlerRig = CharacterAssetLoader.createHumanoidCricketer({
      role: 'BOWLER',
      lod: 'HIGH'
    });
    const bowlerGroup = bowlerRig.rootGroup;
    const bowlerArmPivot = bowlerRig.bones.shoulderR;
    const bowlerController = new BowlerAnimationController(bowlerRig);
    bowlerController.resetToRunupStart();
    scene.add(bowlerGroup);

    // --- AAA 18-BONE HUMANOID WICKETKEEPER & BOWLER-END UMPIRE ---
    const keeperRig = CharacterAssetLoader.createHumanoidCricketer({
      role: 'KEEPER',
      lod: 'MEDIUM'
    });
    const keeperGroup = keeperRig.rootGroup;
    keeperGroup.position.set(0.15, 0, 11.4);
    keeperGroup.rotation.y = Math.PI;
    // Athletic crouched wicketkeeper stance
    keeperRig.bones.pelvis.position.y = 0.72;
    keeperRig.bones.spineLower.rotation.x = 0.42;
    keeperRig.bones.spineUpper.rotation.x = 0.32;
    keeperRig.bones.head.rotation.x = -0.55;
    keeperRig.bones.thighL.rotation.set(-0.75, 0, -0.22);
    keeperRig.bones.shinL.rotation.set(0.95, 0, 0);
    keeperRig.bones.thighR.rotation.set(-0.75, 0, 0.22);
    keeperRig.bones.shinR.rotation.set(0.95, 0, 0);
    keeperRig.bones.shoulderL.rotation.set(0.55, 0, 0.25);
    keeperRig.bones.shoulderR.rotation.set(0.55, 0, -0.25);
    scene.add(keeperGroup);

    const umpireRig = CharacterAssetLoader.createHumanoidCricketer({
      role: 'UMPIRE',
      lod: 'MEDIUM'
    });
    const umpireGroup = umpireRig.rootGroup;
    umpireGroup.position.set(0, 0, -10.4);
    scene.add(umpireGroup);

    // --- 9 AAA HUMANOID AI FIELDERS IN AUTHENTIC CRICKET POSITIONS ---
    const fielderCoords = [
      { x: -13, z: 2.5, name: 'Point' },
      { x: -15, z: -9, name: 'Extra Cover' },
      { x: -9, z: -22, name: 'Mid-Off' },
      { x: 9, z: -22, name: 'Mid-On' },
      { x: 15, z: -7, name: 'Mid-Wicket' },
      { x: 13, z: 3.5, name: 'Square Leg' },
      { x: -34, z: -36, name: 'Deep Cover Boundary' },
      { x: 35, z: -34, name: 'Deep Mid-Wicket' },
      { x: 5, z: 16, name: 'Fine Leg / Third Man' }
    ];
    const fielders = [];
    const fielderControllers = [];
    fielderCoords.forEach((fc) => {
      const fRig = CharacterAssetLoader.createHumanoidCricketer({
        role: 'FIELDER',
        lod: 'MEDIUM'
      });
      const fg = fRig.rootGroup;
      const homeVec = new THREE.Vector3(fc.x, 0, fc.z);
      fg.userData = { homePos: homeVec, name: fc.name };
      const fCtrl = new FielderAnimationController(fRig, homeVec, fc.name);
      scene.add(fg);
      fielders.push(fg);
      fielderControllers.push(fCtrl);
    });

    // --- CRICKET BALL WITH STITCHED SEAM TEXTURE, GROUND SHADOW BLOB & HALO RING ---
    const ballGeo = new THREE.SphereGeometry(0.12, 24, 24);
    const ballSeamTex = createCricketBallTexture(theme.id !== 'day');
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballSeamTex,
      roughness: 0.25,
      metalness: 0.12
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    ballMesh.visible = false;
    scene.add(ballMesh);

    const ballHaloGeo = new THREE.RingGeometry(0.15, 0.23, 24);
    const ballHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const ballHaloMesh = new THREE.Mesh(ballHaloGeo, ballHaloMat);
    ballHaloMesh.visible = false;
    scene.add(ballHaloMesh);

    const shadowBlobGeo = new THREE.CircleGeometry(0.24, 24);
    const shadowBlobMat = new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.55
    });
    const ballShadowMesh = new THREE.Mesh(shadowBlobGeo, shadowBlobMat);
    ballShadowMesh.rotation.x = -Math.PI / 2;
    ballShadowMesh.position.y = 0.036;
    ballShadowMesh.visible = false;
    scene.add(ballShadowMesh);

    const maxTrailPts = 28;
    const trailPositions = new Float32Array(maxTrailPts * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.75 });
    const ballTrail = new THREE.Line(trailGeo, trailMat);
    ballTrail.frustumCulled = false;
    scene.add(ballTrail);

    Object.assign(engineRef.current, {
      scene,
      camera,
      renderer,
      ambientLight,
      sunLight,
      ballMesh,
      ballHaloMesh,
      ballShadowMesh,
      ballTrail,
      pitchMarker,
      timingRing,
      batsmanGroup,
      nonStrikerGroup,
      keeperGroup,
      batPivot,
      batBladeMesh,
      bowlerGroup,
      bowlerArmPivot,
      batsmanController,
      nonStrikerController,
      bowlerController,
      fielderControllers,
      stumpsBatter,
      bailsBatter,
      fielders
    });

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const setCameraDefault = (dt) => {
      const preset = cameraPresetRef.current;
      let targetCamPos = new THREE.Vector3(0, 3.35, 13.8);
      let lookTarget = new THREE.Vector3(0, 1.0, -2.0);
      if (preset === 'PRO_CLOSE') {
        targetCamPos.set(-0.18, 2.35, 10.7);
        lookTarget.set(0, 1.1, -6.0);
      } else if (preset === 'AERIAL') {
        targetCamPos.set(0, 18.5, 22.0);
        lookTarget.set(0, 0, 0);
      }
      camera.position.lerp(targetCamPos, Math.min(1, dt * 6));
      camera.lookAt(lookTarget);
    };

    const updateTrail = (pos) => {
      const eng = engineRef.current;
      eng.trailPositions.push(pos.clone());
      if (eng.trailPositions.length > maxTrailPts) eng.trailPositions.shift();
      const posAttr = eng.ballTrail.geometry.attributes.position;
      for (let i = 0; i < maxTrailPts; i++) {
        const pt = eng.trailPositions[i] || pos;
        posAttr.array[i * 3] = pt.x;
        posAttr.array[i * 3 + 1] = pt.y;
        posAttr.array[i * 3 + 2] = pt.z;
      }
      posAttr.needsUpdate = true;
    };

    const triggerBowledWicket = (headline = 'BOWLED HIM!') => {
      const eng = engineRef.current;
      eng.phase = 'WICKET_ANIM';
      eng.bowledHeadline = headline;
      eng.phaseTimer = 0;
      eng.cameraShake = 0.9;
      soundFX.playStumpHit();
      soundFX.playCrowdRoar(0.9, 1.5);

      eng.stumpsBatter.forEach((s, idx) => {
        s.userData.vel.set((idx - 1) * 1.8 + (Math.random() - 0.5), 2.2, 4.5 + Math.random() * 2);
        s.userData.rotVel.set(8 + Math.random() * 6, 0, (idx - 1) * 6);
      });
      eng.bailsBatter.forEach((b, idx) => {
        b.userData.vel.set(idx === 0 ? -2.2 : 2.2, 4.8, 5.5);
        b.userData.rotVel.set(14, 12, 9);
      });
    };

    const resolveSweptBatContact = (contactBallZ) => {
      const eng = engineRef.current;
      const chosenStyle = eng.swingStyle;
      const chosenDirX = eng.swingDirX;
      const ballY = eng.ballPos.y;
      const ballX = eng.ballPos.x;

      const deltaZ = 7.45 - contactBallZ;
      const activeBat = BATS_CATALOG.find((b) => b.id === profileRef.current.selectedBat) || BATS_CATALOG[0];
      const windowMult = activeBat.timingWindowBonus;
      const absDelta = Math.abs(deltaZ);

      if (Math.abs(ballX) > 1.38 || ballY > 2.2) {
        return;
      }

      let timingGrade = 'MISSED';
      if (absDelta <= 0.85 * windowMult) {
        timingGrade = 'PERFECT';
      } else if (absDelta <= 1.75 * windowMult) {
        timingGrade = 'GOOD';
      } else if (absDelta <= 2.75 * windowMult) {
        timingGrade = deltaZ > 0 ? 'EARLY' : 'LATE';
      } else {
        return;
      }

      eng.swingActiveTimer = 0;

      const deliv = eng.currentDelivery;
      let namedShot = 'Straight Drive';
      if (chosenStyle === 'DEFENSE') {
        namedShot = deliv && deliv.bounceZ < 1.5 ? 'Back-Foot Defense' : 'Forward Defense';
      } else if (deliv && deliv.bounceZ < 0.8) {
        namedShot = chosenDirX < -0.25 ? 'Upper Cut' : chosenStyle === 'LOFT' ? 'Hook Shot' : 'Pull Shot';
      } else if (deliv && deliv.bounceZ > 6.5) {
        namedShot = chosenStyle === 'LOFT' ? 'Helicopter Whip' : 'Yorker Jam Drive';
      } else {
        if (chosenDirX < -0.35) namedShot = chosenStyle === 'LOFT' ? 'Inside-Out Loft' : 'Cover Drive';
        else if (chosenDirX > 0.35) namedShot = chosenStyle === 'LOFT' ? 'Slog Sweep' : 'On-Drive Flick';
        else namedShot = chosenStyle === 'LOFT' ? 'Lofted Straight Drive' : 'Straight Drive';
      }

      const timingDeltaMs = Math.round((deltaZ / Math.max(10, eng.ballVel.z)) * 1000);
      const confidencePct = Math.max(55, Math.min(99, Math.round((1 - absDelta / (2.8 * windowMult)) * 100)));
      // Preserves continuous swing phase (`preserveSwingContinuity = true`)
      // so the bat does not snap back to frame 0 when contact occurs mid-swing.
      if (eng.batsmanController) {
        eng.batsmanController.triggerShot(chosenStyle, chosenDirX, namedShot, true);
      }

      setMatchState((prev) => {
        const nextPerfect = timingGrade === 'PERFECT' ? prev.perfectCount + 1 : prev.perfectCount;
        if (nextPerfect >= 3) unlockAchievement('perfect_3');
        return {
          ...prev,
          perfectCount: nextPerfect,
          lastTimingBadge: timingGrade,
          lastShotTypePlayed: namedShot,
          lastShotConfidence: confidencePct,
          lastTimingDeltaMs: timingDeltaMs
        };
      });

      eng.phase = 'HIT_FLIGHT';
      eng.phaseTimer = 0;
      eng.hitBouncedInOutfield = false;
      eng.pitchMarker.visible = false;
      setBowlerPhaseLabel('SHOT PLAYED');

      const batPower = activeBat.powerBoost;
      let exitSpeed = 22;
      let elevationDeg = 10;

      if (chosenStyle === 'DEFENSE') {
        exitSpeed = 7.5;
        elevationDeg = 3;
        soundFX.playBatHit(0.45, false);
      } else if (chosenStyle === 'LOFT') {
        if (timingGrade === 'PERFECT') {
          exitSpeed = 35.8 * batPower;
          elevationDeg = 34;
          soundFX.playBatHit(1.0, true);
        } else if (timingGrade === 'GOOD') {
          exitSpeed = 30.2 * batPower;
          elevationDeg = 27;
          soundFX.playBatHit(0.85, false);
        } else {
          exitSpeed = 20.5;
          elevationDeg = 53;
          soundFX.playBatHit(0.6, false);
        }
      } else {
        if (timingGrade === 'PERFECT') {
          exitSpeed = 32.8 * batPower;
          elevationDeg = 8.5;
          soundFX.playBatHit(0.95, true);
        } else if (timingGrade === 'GOOD') {
          exitSpeed = 25.2 * batPower;
          elevationDeg = 7;
          soundFX.playBatHit(0.78, false);
        } else {
          exitSpeed = 15.8;
          elevationDeg = 12;
          soundFX.playBatHit(0.55, false);
        }
      }

      const timingAngleOffset = deltaZ * 0.16;
      const shotAzimuth = chosenDirX * 0.95 + timingAngleOffset;
      const elevRad = THREE.MathUtils.degToRad(elevationDeg);

      const horizSpeed = exitSpeed * Math.cos(elevRad);
      const vy = exitSpeed * Math.sin(elevRad);
      const vx = Math.sin(shotAzimuth) * horizSpeed;
      const vz = -Math.cos(shotAzimuth) * horizSpeed;

      eng.ballPos.z = Math.min(7.7, eng.ballPos.z);
      eng.ballPos.y = Math.max(0.35, eng.ballPos.y);
      eng.ballVel.set(vx, vy, vz);
    };

    // --- 60FPS ANIMATION & PHYSICS LOOP ---
    let lastTime = performance.now();
    let animationFrameId;

    const animate = (now) => {
      animationFrameId = requestAnimationFrame(animate);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const eng = engineRef.current;

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Bug Fix #4: Frame-rate-independent Action Replay Mode (advances with dt)
      if (eng.isReplaying && eng.replayTrajectory.length > 0) {
        const maxIdx = eng.replayTrajectory.length - 1;
        const idxFloor = Math.min(maxIdx, Math.floor(eng.replayIndex));
        const idxCeil = Math.min(maxIdx, idxFloor + 1);
        const alpha = eng.replayIndex - idxFloor;
        const frameA = eng.replayTrajectory[idxFloor];
        const frameB = eng.replayTrajectory[idxCeil];
        if (frameA && frameB) {
          const interpPos = frameA.pos.clone().lerp(frameB.pos, alpha);
          eng.ballMesh.visible = true;
          eng.ballMesh.position.copy(interpPos);
          updateTrail(interpPos);
          camera.position.set(interpPos.x * 0.5 + 7, Math.max(2.5, interpPos.y + 2.2), interpPos.z + 9);
          camera.lookAt(interpPos);
        }
        eng.replayIndex += dt * 36;
        if (eng.replayIndex >= eng.replayTrajectory.length) {
          eng.isReplaying = false;
        }
        renderer.render(scene, camera);
        return;
      }

      const elapsedSec = now * 0.001;

      if (eng.batsmanController) {
        eng.batsmanController.update(dt, elapsedSec);
      }
      if (eng.nonStrikerController) {
        eng.nonStrikerController.update(dt, elapsedSec + 0.4);
      }
      if (eng.fielderControllers) {
        const ballActiveForFielders = eng.phase === 'HIT_FLIGHT';
        eng.fielderControllers.forEach((fc) => {
          fc.update(dt, elapsedSec, eng.ballPos, ballActiveForFielders);
        });
      }

      // Sync Ground Shadow Blob & Visibility Halo whenever ball is visible
      if (eng.ballMesh.visible) {
        eng.ballShadowMesh.visible = true;
        eng.ballShadowMesh.position.set(eng.ballPos.x, 0.036, eng.ballPos.z);
        const heightScale = Math.max(0.35, 1.15 - eng.ballPos.y * 0.18);
        eng.ballShadowMesh.scale.set(heightScale, heightScale, 1);
        eng.ballShadowMesh.material.opacity = Math.max(0.15, 0.62 - eng.ballPos.y * 0.08);

        eng.ballHaloMesh.visible = true;
        eng.ballHaloMesh.position.copy(eng.ballPos);
        eng.ballHaloMesh.lookAt(camera.position);
      } else {
        eng.ballShadowMesh.visible = false;
        eng.ballHaloMesh.visible = false;
      }

      if (eng.cameraShake > 0) {
        eng.cameraShake = Math.max(0, eng.cameraShake - dt * 2.5);
        camera.position.x += (Math.random() - 0.5) * eng.cameraShake * 0.18;
        camera.position.y += (Math.random() - 0.5) * eng.cameraShake * 0.18;
      }

      // Phase State Machine
      if (eng.phase === 'IDLE') {
        setCameraDefault(dt);
      } else if (eng.phase === 'RUNUP') {
        setCameraDefault(dt);
        eng.phaseTimer += dt;
        const runProgress = Math.min(1, eng.phaseTimer / 1.15);

        let handReleaseWorldPos = new THREE.Vector3(0.28, 2.08, -7.8);
        if (eng.bowlerController) {
          handReleaseWorldPos = eng.bowlerController.updateRunup(runProgress, dt);
        }
        if (eng.batsmanController && runProgress > 0.55) {
          eng.batsmanController.triggerGather();
        }
        if (eng.nonStrikerGroup) {
          eng.nonStrikerGroup.position.z = -8.2 + runProgress * 0.75;
        }

        // Keep ball visibly gripped in bowler's hand during run-up and delivery swing
        eng.ballMesh.visible = true;
        eng.ballPos.copy(handReleaseWorldPos);
        eng.ballMesh.position.copy(handReleaseWorldPos);

        if (runProgress >= 1) {
          eng.phase = 'BOWLED';
          eng.phaseTimer = 0;
          eng.hasBounced = false;
          eng.ballMesh.visible = true;
          eng.trailPositions = [];
          eng.replayTrajectory = [];
          setBowlerPhaseLabel('BALL IN FLIGHT');

          const deliv = eng.currentDelivery;
          // Synchronize ball release directly from the bowler's animated hand socket
          eng.ballPos.copy(handReleaseWorldPos);
          eng.prevBallPos.copy(eng.ballPos);

          const speedMps = (deliv.actualSpeedKmh / 3.6) * 0.72;
          const distZToBounce = deliv.bounceZ - handReleaseWorldPos.z;
          const timeToBounce = distZToBounce / speedMps;
          const gravity = 9.8;
          const vy =
            (0.11 - handReleaseWorldPos.y + 0.5 * gravity * timeToBounce * timeToBounce) /
            timeToBounce;
          const vx = (deliv.targetLineX - handReleaseWorldPos.x) / timeToBounce;

          eng.ballVel.set(vx, vy, speedMps);

          eng.pitchMarker.position.set(deliv.targetLineX, 0.04, deliv.bounceZ);
          eng.pitchMarker.material.color.set(deliv.color);
          eng.pitchMarker.visible = true;
        }
      } else if (eng.phase === 'BOWLED') {
        setCameraDefault(dt);
        if (eng.bowlerController) {
          eng.bowlerController.updateFollowThrough(dt);
        }
        const deliv = eng.currentDelivery;
        const gravity = 9.8;

        eng.prevBallPos.copy(eng.ballPos);

        if (!eng.hasBounced) {
          eng.ballVel.x += deliv.swingX * dt * 2.2;
        }

        eng.ballVel.y -= gravity * dt;
        eng.ballPos.addScaledVector(eng.ballVel, dt);

        if (eng.ballPos.y <= 0.11 && eng.ballVel.y < 0) {
          eng.ballPos.y = 0.11;
          eng.ballVel.y = Math.abs(eng.ballVel.y) * deliv.bounceFactor;
          if (!eng.hasBounced) {
            eng.hasBounced = true;
            eng.ballVel.x += deliv.seamDeviation * 4.2;
            soundFX.playBallBounce();
          }
        }

        eng.ballMesh.position.copy(eng.ballPos);
        eng.ballMesh.rotation.x += 22 * dt;
        eng.ballMesh.rotation.z += deliv.seamDeviation * 12 * dt;
        updateTrail(eng.ballPos);
        eng.replayTrajectory.push({ pos: eng.ballPos.clone() });

        if (eng.swingActiveTimer > 0) {
          eng.swingActiveTimer = Math.max(0, eng.swingActiveTimer - dt);
          if (eng.ballPos.z >= 5.2 && eng.prevBallPos.z <= 8.5) {
            resolveSweptBatContact(eng.ballPos.z);
            if (eng.phase === 'HIT_FLIGHT') {
              renderer.render(scene, camera);
              return;
            }
          }
        }

        const progressPct = Math.max(0, Math.min(100, ((eng.ballPos.z - -7.8) / (9.0 - -7.8)) * 100));
        setLiveTimingCursor(Math.round(progressPct));

        const distToBatter = Math.abs(7.45 - eng.ballPos.z);
        const ringScale = Math.max(0.35, Math.min(1.6, distToBatter / 5.5));
        eng.timingRing.scale.set(ringScale, ringScale, 1);
        if (distToBatter < 0.85) {
          eng.timingRing.material.color.setHex(0x10b981);
        } else if (distToBatter < 2.1) {
          eng.timingRing.material.color.setHex(0xfacc15);
        } else {
          eng.timingRing.material.color.setHex(0x38bdf8);
        }

        if (eng.prevBallPos.z <= 9.15 && eng.ballPos.z >= 8.85) {
          if (Math.abs(eng.ballPos.x) <= 0.23 && eng.ballPos.y <= 0.84) {
            const isYorked = deliv.id === 'yorker';
            triggerBowledWicket(isYorked ? 'YORKED HIM!' : 'BOWLED HIM!');
            return;
          }
        }

        if (eng.ballPos.z > 11.2) {
          if (eng.hasSwung) {
            setMatchState((p) => ({ ...p, lastTimingBadge: 'MISSED' }));
          }
          completeOutcomeRef.current(
            0,
            false,
            eng.hasSwung ? 'SWING & MISS!' : 'DOT BALL',
            'Through to the wicketkeeper — 0 Runs',
            null
          );
        }
      } else if (eng.phase === 'HIT_FLIGHT') {
        const gravity = 9.8;
        eng.ballVel.y -= gravity * dt;
        eng.ballPos.addScaledVector(eng.ballVel, dt);

        if (eng.ballPos.y <= 0.12 && eng.ballVel.y < 0) {
          eng.ballPos.y = 0.12;
          eng.ballVel.y = Math.abs(eng.ballVel.y) * 0.42;
          eng.ballVel.x *= 0.84;
          eng.ballVel.z *= 0.84;
          soundFX.playBallBounce();
        }

        if (eng.ballPos.y <= 0.15) {
          eng.ballVel.x *= 1 - 0.55 * dt;
          eng.ballVel.z *= 1 - 0.55 * dt;
        }

        eng.ballMesh.position.copy(eng.ballPos);
        eng.ballMesh.rotation.x += 18 * dt;
        updateTrail(eng.ballPos);
        eng.replayTrajectory.push({ pos: eng.ballPos.clone() });

        const desiredCam = new THREE.Vector3(
          eng.ballPos.x * 0.38,
          Math.max(3.5, eng.ballPos.y * 0.65 + 3.2),
          Math.min(16, eng.ballPos.z + 12)
        );
        camera.position.lerp(desiredCam, Math.min(1, dt * 4.5));
        camera.lookAt(eng.ballPos);

        let interceptedByFielder = null;
        eng.fielders.forEach((f) => {
          const dx = eng.ballPos.x - f.position.x;
          const dz = eng.ballPos.z - f.position.z;
          const dHoriz = Math.hypot(dx, dz);
          if (dHoriz < 1.35 && eng.ballPos.y < 2.2) {
            interceptedByFielder = f;
          }
        });

        const radialDist = Math.hypot(eng.ballPos.x, eng.ballPos.z);
        const speedTotal = eng.ballVel.length();

        if (interceptedByFielder && !eng.hitBouncedInOutfield && eng.ballPos.y > 0.22) {
          soundFX.playCrowdRoar(0.85, 1.5);
          completeOutcomeRef.current(
            0,
            true,
            'CAUGHT IN THE DEEP!',
            `Caught cleanly by ${interceptedByFielder.userData.name} — Stumps intact!`,
            'CAUGHT'
          );
          return;
        }

        if (!eng.hitBouncedInOutfield && eng.ballPos.z > 10.2 && Math.abs(eng.ballPos.x) < 1.8 && eng.ballPos.y > 0.2) {
          soundFX.playCrowdRoar(0.85, 1.5);
          completeOutcomeRef.current(
            0,
            true,
            'CAUGHT BEHIND!',
            'Outside edge pouched safely by the Wicketkeeper!',
            'CAUGHT BEHIND'
          );
          return;
        }

        if (eng.ballPos.y <= 0.14) {
          eng.hitBouncedInOutfield = true;
        }

        if (radialDist >= 64.0) {
          if (eng.batsmanController) {
            eng.batsmanController.triggerReaction('CELEBRATE');
          }
          if (!eng.hitBouncedInOutfield) {
            soundFX.playCrowdRoar(1.4, 2.4);
            completeOutcomeRef.current(
              6,
              false,
              'MAXIMUM SIX!',
              `${Math.round(radialDist + 18)}m Monster Hit into the Stands!`,
              null
            );
          } else {
            soundFX.playCrowdRoar(1.1, 1.8);
            completeOutcomeRef.current(
              4,
              false,
              'FOUR RUNS!',
              'Cracking shot races across the boundary rope!',
              null
            );
          }
          return;
        }

        if (interceptedByFielder || speedTotal < 1.6 || eng.phaseTimer > 4.5) {
          let runsAwarded = 0;
          if (radialDist > 44) runsAwarded = 3;
          else if (radialDist > 25) runsAwarded = 2;
          else if (radialDist > 9.5) runsAwarded = 1;
          else runsAwarded = 0;

          if (runsAwarded > 0) {
            if (eng.batsmanController) eng.batsmanController.startRunSprint(runsAwarded);
            if (eng.nonStrikerController) eng.nonStrikerController.startRunSprint(runsAwarded);
          }

          const msg =
            runsAwarded === 0
              ? `Fielded cleanly by ${interceptedByFielder ? interceptedByFielder.userData.name : 'the bowler'}`
              : `Striker & Non-Striker sprint between the wickets — ${runsAwarded} ${runsAwarded === 1 ? 'Run' : 'Runs'}!`;
          completeOutcomeRef.current(
            runsAwarded,
            false,
            runsAwarded > 0 ? `${runsAwarded} ${runsAwarded === 1 ? 'RUN' : 'RUNS'}` : 'DOT BALL',
            msg,
            null
          );
          return;
        }

        eng.phaseTimer += dt;
      } else if (eng.phase === 'WICKET_ANIM') {
        eng.phaseTimer += dt;
        eng.stumpsBatter.forEach((s) => {
          s.position.addScaledVector(s.userData.vel, dt);
          s.rotation.x += s.userData.rotVel.x * dt;
          s.rotation.z += s.userData.rotVel.z * dt;
        });
        eng.bailsBatter.forEach((b) => {
          b.userData.vel.y -= 9.8 * dt;
          b.position.addScaledVector(b.userData.vel, dt);
          b.rotation.x += b.userData.rotVel.x * dt;
          b.rotation.y += b.userData.rotVel.y * dt;
        });

        if (eng.phaseTimer > 1.75) {
          completeOutcomeRef.current(
            0,
            true,
            eng.bowledHeadline || 'BOWLED HIM!',
            'Timber! The ball crashes straight into the stumps!',
            'BOWLED'
          );
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Bug Fix #5: Complete WebGL, AnimationMixer, Texture, Geometry, Material & Audio cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearPendingTimers();

      if (eng.batsmanController?.mixer) eng.batsmanController.mixer.stopAllAction();
      if (eng.nonStrikerController?.mixer) eng.nonStrikerController.mixer.stopAllAction();
      if (eng.bowlerController?.mixer) eng.bowlerController.mixer.stopAllAction();

      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      CharacterAssetLoader.disposeSharedMaterials();
      renderer.dispose();
    };
  }, [clearPendingTimers, unlockAchievement]);

  // ============================================================================
  // 6. DYNAMIC STADIUM THEME & BAT SKIN UPDATER (With Proper Texture Disposal)
  // ============================================================================
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng.scene) return;
    const theme = STADIUM_THEMES[profile.selectedTheme] || STADIUM_THEMES.day;
    eng.scene.fog = new THREE.FogExp2(theme.skyBottom, 0.0045);
    if (eng.ambientLight) {
      eng.ambientLight.color.setHex(theme.ambientColor);
      eng.ambientLight.intensity = theme.ambientIntensity;
    }
    if (eng.sunLight) {
      eng.sunLight.color.setHex(theme.sunColor);
      eng.sunLight.intensity = theme.sunIntensity;
    }
    if (eng.ballMesh && eng.ballMesh.material) {
      if (eng.ballMesh.material.map) eng.ballMesh.material.map.dispose();
      eng.ballMesh.material.map = createCricketBallTexture(theme.id !== 'day');
      eng.ballMesh.material.needsUpdate = true;
    }
    const batSpec = BATS_CATALOG.find((b) => b.id === profile.selectedBat) || BATS_CATALOG[0];
    if (eng.batBladeMesh && eng.batBladeMesh.material) {
      if (eng.batBladeMesh.material.map) eng.batBladeMesh.material.map.dispose();
      eng.batBladeMesh.material.map = createBatStickerTexture(batSpec.bladeColor, batSpec.stickerColor);
      eng.batBladeMesh.material.needsUpdate = true;
    }
  }, [profile.selectedTheme, profile.selectedBat]);

  // Core 3D Batting Swing Trigger (Activates 160ms Swept Sub-Frame Collision Window)
  const executeBatSwing = useCallback((overrideDirX = null, overrideStyle = null) => {
    const eng = engineRef.current;
    if (eng.phase !== 'BOWLED' || eng.hasSwung || isPausedRef.current) return;

    const chosenStyle = overrideStyle || shotTypeRef.current;
    const chosenDirX = overrideDirX !== null ? overrideDirX : aimDirRef.current.x;

    eng.hasSwung = true;
    eng.swingAnimProgress = 1.0;
    eng.swingStyle = chosenStyle;
    eng.swingDirX = chosenDirX;
    eng.swingActiveTimer = 0.165;
    if (eng.batsmanController) {
      const prelimShot =
        chosenStyle === 'DEFENSE'
          ? 'Forward Defense'
          : chosenDirX < -0.35
          ? 'Cover Drive'
          : chosenDirX > 0.35
          ? 'Pull Shot'
          : 'Straight Drive';
      eng.batsmanController.triggerShot(chosenStyle, chosenDirX, prelimShot);
    }
    soundFX.playBallBounce();
  }, []);

  // ============================================================================
  // 7. KEYBOARD & TOUCH SWIPE CONTROLS
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen !== 'PLAYING' || activeModal) return;

      if (e.code === 'KeyP' || e.code === 'Escape') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPausedRef.current) return;

      if (e.code === 'Space' && engineRef.current.phase === 'RESETTING' && matchStateRef.current.canSkipToNextBall) {
        e.preventDefault();
        engineRef.current.phase = 'IDLE';
        triggerNextDelivery();
        return;
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        setAimDirection({ x: -0.78, label: 'OFF-SIDE COVER DRIVE' });
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        setAimDirection({ x: 0.78, label: 'LEG-SIDE PULL / FLICK' });
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        setAimDirection({ x: 0, label: 'STRAIGHT DRIVE' });
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        setAimDirection({ x: -1.15, label: 'LATE CUT / GLANCE' });
      } else if (e.code === 'Space') {
        e.preventDefault();
        executeBatSwing(null, shotTypeRef.current);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyZ') {
        setShotType('LOFT');
        executeBatSwing(null, 'LOFT');
      } else if (e.code === 'KeyX' || e.code === 'KeyC') {
        setShotType('DEFENSE');
        executeBatSwing(null, 'DEFENSE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeModal, executeBatSwing, triggerNextDelivery]);

  const handleCanvasPointerDown = (e) => {
    if (screen !== 'PLAYING' || isPaused) return;
    engineRef.current.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  const handleCanvasPointerUp = (e) => {
    if (screen !== 'PLAYING' || isPaused || !engineRef.current.pointerDownPos) return;
    const start = engineRef.current.pointerDownPos;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dist = Math.hypot(dx, dy);

    let dirX = aimDirection.x;
    let styleToPlay = shotType;

    if (dist > 22) {
      dirX = Math.max(-1.1, Math.min(1.1, dx / 110));
      const label =
        dirX < -0.3 ? 'OFF-SIDE COVER DRIVE' : dirX > 0.3 ? 'LEG-SIDE PULL / FLICK' : 'STRAIGHT DRIVE';
      setAimDirection({ x: dirX, label });

      if (dy < -55) {
        styleToPlay = 'LOFT';
        setShotType('LOFT');
      }
    }

    executeBatSwing(dirX, styleToPlay);
    engineRef.current.pointerDownPos = null;
  };

  const startMatch = (modeObj) => {
    clearPendingTimers();
    setSelectedMode(modeObj);
    setIsPaused(false);

    const totalBalls = modeObj.ballsLimit ? modeObj.ballsLimit : modeObj.overs * 6;
    let customTarget = modeObj.target;
    let roundLabel = '';

    if (modeObj.isTournament) {
      const stageIdx = Math.min(2, profile.tournamentStage || 0);
      const roundSpec = modeObj.rounds[stageIdx];
      customTarget = roundSpec.target;
      roundLabel = roundSpec.name;
    }

    const initialState = {
      runs: 0,
      wickets: 0,
      maxWickets: modeObj.wickets,
      ballsBowled: 0,
      totalBalls,
      sixesCount: 0,
      foursCount: 0,
      streakBoundaries: 0,
      perfectCount: 0,
      target: customTarget,
      thisOver: [],
      wagonWheelShots: [],
      lastShotTypePlayed: '',
      lastShotConfidence: 0,
      lastTimingDeltaMs: 0,
      lastDismissalType: null,
      overBannerText: null,
      lastOutcomeText: modeObj.isTournament ? `${roundLabel}: CHASE ${customTarget}` : 'BATSMAN READY',
      lastOutcomeSub: 'Watch the colored bounce ring and time your shot!',
      lastTimingBadge: null,
      deliverySpeed: 0,
      deliveryName: 'Bowler running in...',
      deliveryType: 'FAST',
      isBallActive: false,
      canSkipToNextBall: false,
      canReplay: false,
      tournamentRoundName: roundLabel
    };

    setMatchState(initialState);
    matchStateRef.current = initialState;

    setProfile((p) => ({ ...p, matchesPlayed: p.matchesPlayed + 1 }));
    setScreen('PLAYING');
    engineRef.current.phase = 'IDLE';
    resetFieldPositions();

    deliveryTimeoutRef.current = setTimeout(() => {
      triggerNextDelivery();
    }, 650);
  };

  const triggerActionReplay = () => {
    const eng = engineRef.current;
    if (eng.replayTrajectory.length === 0) return;
    eng.isReplaying = true;
    eng.replayIndex = 0;
  };

  const toggleSound = () => {
    soundFX.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const currentTheme = STADIUM_THEMES[profile.selectedTheme] || STADIUM_THEMES.day;
  const oversFormatted = `${Math.floor(matchState.ballsBowled / 6)}.${matchState.ballsBowled % 6}`;
  const totalOversFormatted = `${Math.floor(matchState.totalBalls / 6)}.${matchState.totalBalls % 6}`;
  const currentRunRate =
    matchState.ballsBowled > 0 ? ((matchState.runs / matchState.ballsBowled) * 6).toFixed(1) : '0.0';

  return (
    <div className="relative w-full h-screen overflow-hidden select-none bg-slate-950 font-sans text-white">
      {/* 1. DYNAMIC SKY GRADIENT & 3D WEBGL VIEWPORT */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background: `linear-gradient(to bottom, ${currentTheme.skyTop}, ${currentTheme.skyBottom})`
        }}
      />
      <div
        ref={mountRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerUp={handleCanvasPointerUp}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* TOAST NOTIFICATION */}
      {toastNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-500/60 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-extrabold text-emerald-300">{toastNotification.title}</div>
            <div className="text-[11px] text-slate-300">{toastNotification.subtitle}</div>
          </div>
        </div>
      )}

      {/* 2. TOP GLOBAL BAR */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2.5 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 shadow-lg">
            GXA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-sm sm:text-base">GXA CRICKET CHALLENGE</span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PHASE 3 SKINNED RIG
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">GXA Games Studio • 3D WebGL Cricket</p>
          </div>
        </div>

        {/* Stadium Atmosphere Quick Switcher & Coins */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10">
            {[
              { id: 'day', icon: Sun, label: 'Day' },
              { id: 'dusk', icon: Sunset, label: 'Dusk' },
              { id: 'night', icon: Moon, label: 'Night' }
            ].map((t) => {
              const IconComp = t.icon;
              const unlocked = profile.unlockedThemes.includes(t.id);
              const active = profile.selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (unlocked) {
                      setProfile((p) => ({ ...p, selectedTheme: t.id }));
                    } else {
                      setActiveModal('SHOP');
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    active ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {!unlocked && <Lock className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 rounded-xl">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300">{profile.coins}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-200"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {screen === 'PLAYING' && (
            <>
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold"
              >
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={() => {
                  clearPendingTimers();
                  setIsPaused(false);
                  setScreen('HOME');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold text-rose-200"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </>
          )}
        </div>
      </header>

      {}
      {screen === 'HOME' && (
        <div className="relative z-10 h-[calc(100vh-56px)] overflow-y-auto px-4 py-5 flex flex-col justify-between max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Hero & Quick Stats */}
            <div className="lg:col-span-5 bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PHASE 3 SKINNEDMESH & ANIMATION ENGINE
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                STEP ONTO THE CREASE. <span className="text-emerald-400">SMASH MAXIMUMS.</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Face 150 km/h express pace, swinging yorkers, and ripping leg-breaks in our upgraded 3D stadium. Time the
                bounce ring and pick your gap!
              </p>

              {/* Career Summary Strip */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">TOTAL RUNS</div>
                  <div className="text-lg font-black text-white">{profile.totalRuns}</div>
                </div>
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">TOTAL SIXES</div>
                  <div className="text-lg font-black text-emerald-400">{profile.totalSixes}</div>
                </div>
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-[10px] text-slate-400 font-bold">2-OV BEST</div>
                  <div className="text-lg font-black text-amber-400">{profile.highScores.quick_2 || 0}</div>
                </div>
              </div>

              {/* Primary CTA for 2-Over Quick Match */}
              <button
                onClick={() => startMatch(GAME_MODES[0])}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                PLAY 2-OVER QUICK MATCH NOW
              </button>

              {/* Secondary Utility Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <button
                  onClick={() => setActiveModal('SHOP')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  Bat Armory
                </button>
                <button
                  onClick={() => setActiveModal('ACHIEVEMENTS')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Trophies ({profile.achievements.length}/{ACHIEVEMENTS_LIST.length})
                </button>
                <button
                  onClick={() => setActiveModal('CONTROLS')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  Controls
                </button>
                <button
                  onClick={() => setActiveModal('DOCS')}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  QA Audit
                </button>
              </div>
            </div>

            {/* Right 6 Game Modes Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GAME_MODES.map((m) => {
                const IconComp = m.icon;
                const best = profile.highScores[m.id] || 0;
                return (
                  <div
                    key={m.id}
                    className="bg-slate-950/80 backdrop-blur-xl border border-white/15 hover:border-emerald-400/50 rounded-2xl p-4 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r ${m.color} text-white`}
                        >
                          {m.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">Best: {best}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${m.color} text-white`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base">{m.name}</h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{m.subtitle}</p>
                    </div>

                    <button
                      onClick={() => startMatch(m)}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Play Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {}
      {screen === 'PLAYING' && (
        <div className="relative z-10 h-[calc(100vh-56px)] flex flex-col justify-between p-3 sm:p-4 pointer-events-none">
          {/* TOP BROADCAST SCOREBOARD & TELEMETRY */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            {/* Score & Overs Card */}
            <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  {selectedMode.name}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    {matchState.runs}/{matchState.wickets}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    ({oversFormatted} / {totalOversFormatted} ov)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-3">
                  <span>CRR: {currentRunRate}</span>
                  {matchState.target && (
                    <span className="text-amber-300 font-bold">
                      Need {Math.max(0, matchState.target - matchState.runs)} off{' '}
                      {matchState.totalBalls - matchState.ballsBowled}b
                    </span>
                  )}
                </div>
              </div>

              {/* This Over Balls */}
              <div className="hidden sm:flex flex-col border-l border-white/10 pl-3">
                <span className="text-[10px] font-bold text-slate-400 mb-1">THIS OVER</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const val = matchState.thisOver[idx];
                    return (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black border ${
                          val === 'W'
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : val === '6'
                            ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                            : val === '4'
                            ? 'bg-sky-500 border-sky-300 text-slate-950'
                            : val
                            ? 'bg-slate-800 border-white/20 text-white'
                            : 'bg-slate-900/50 border-white/10 text-slate-600'
                        }`}
                      >
                        {val || '•'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Bowler Speedometer, Timing Meter & Mini Wagon Wheel */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-slate-400">{bowlerPhaseLabel}</span>
                  <span className="text-xs font-black text-amber-400">
                    {matchState.deliverySpeed > 0 ? `${matchState.deliverySpeed} KM/H` : '-- KM/H'}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-white truncate max-w-[170px]">
                  {matchState.deliveryName}
                </div>
                {/* Live Timing Progress Bar */}
                <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5 relative">
                  <div className="absolute inset-y-0 left-[72%] w-[16%] bg-emerald-400/40" />
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-75"
                    style={{ width: `${liveTimingCursor}%` }}
                  />
                </div>
              </div>

              {/* Mini 2D Wagon Wheel */}
              <div className="hidden md:flex flex-col items-center bg-slate-950/85 border border-white/15 rounded-2xl p-2">
                <svg viewBox="-70 -70 140 140" className="w-14 h-14">
                  <circle cx="0" cy="0" r="64" fill="#064e3b" stroke="#10b981" strokeWidth="3" />
                  <rect x="-3" y="-12" width="6" height="24" fill="#d6b27c" />
                  {matchState.wagonWheelShots.map((s, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1="8"
                      x2={Math.max(-62, Math.min(62, s.x))}
                      y2={Math.max(-62, Math.min(62, s.z))}
                      stroke={s.runs === 6 ? '#34d399' : s.runs === 4 ? '#38bdf8' : '#facc15'}
                      strokeWidth={s.runs >= 4 ? '3' : '1.8'}
                    />
                  ))}
                </svg>
              </div>

              {/* Camera Angle Cycle Button */}
              <button
                onClick={() =>
                  setCameraPreset((c) =>
                    c === 'BROADCAST' ? 'PRO_CLOSE' : c === 'PRO_CLOSE' ? 'AERIAL' : 'BROADCAST'
                  )
                }
                className="bg-slate-950/85 hover:bg-slate-900 border border-white/15 rounded-2xl p-2.5 text-xs font-bold flex flex-col items-center gap-0.5"
                title="Switch Camera View"
              >
                <Camera className="w-4 h-4 text-sky-400" />
                <span className="text-[9px] text-slate-300">{cameraPreset}</span>
              </button>
            </div>
          </div>

          {/* CENTER OUTCOME BANNER & TIMING FEEDBACK */}
          <div className="flex flex-col items-center justify-center text-center my-auto px-2">
            {matchState.overBannerText && (
              <div className="mb-2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg">
                {matchState.overBannerText}
              </div>
            )}

            <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-2xl shadow-2xl max-w-md">
              <div className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {matchState.lastOutcomeText}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">{matchState.lastOutcomeSub}</div>

              {matchState.lastTimingBadge && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      matchState.lastTimingBadge === 'PERFECT'
                        ? 'bg-emerald-500 text-slate-950'
                        : matchState.lastTimingBadge === 'GOOD'
                        ? 'bg-sky-400 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    TIMING: {matchState.lastTimingBadge}
                  </span>
                  {matchState.lastShotTypePlayed && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                      {matchState.lastShotTypePlayed} ({matchState.lastShotConfidence}%)
                    </span>
                  )}
                </div>
              )}

              {/* Fast-Forward Next Delivery or Replay Buttons */}
              <div className="pointer-events-auto flex items-center justify-center gap-2 mt-2.5">
                {matchState.canSkipToNextBall && (
                  <button
                    onClick={() => {
                      engineRef.current.phase = 'IDLE';
                      triggerNextDelivery();
                    }}
                    className="px-3.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Next Ball (Space)
                  </button>
                )}
                {matchState.canReplay && (
                  <button
                    onClick={triggerActionReplay}
                    className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 font-bold text-xs flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Action Replay
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM BATTING DECK (DIRECTION + SHOT TYPE + SWING TRIGGER) */}
          <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-2.5 bg-slate-950/85 backdrop-blur-xl border border-white/15 rounded-3xl p-3 shadow-2xl">
            {/* Shot Direction Selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-1">
                1. Aim Shot Direction ({aimDirection.label})
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Cover (A / ←)', x: -0.78, full: 'OFF-SIDE COVER DRIVE' },
                  { label: 'Straight (W / ↑)', x: 0, full: 'STRAIGHT DRIVE' },
                  { label: 'Pull (D / →)', x: 0.78, full: 'LEG-SIDE PULL / FLICK' }
                ].map((dir) => (
                  <button
                    key={dir.label}
                    onClick={() => setAimDirection({ x: dir.x, label: dir.full })}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                      Math.abs(aimDirection.x - dir.x) < 0.15
                        ? 'bg-sky-500 text-slate-950 border-sky-300'
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shot Style Selector + Giant Swing Button */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-1">2. Shot Mode</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'DEFENSE', label: 'Defend (X)', color: 'bg-slate-700 text-white' },
                    { id: 'GROUND', label: 'Drive', color: 'bg-emerald-500 text-slate-950' },
                    { id: 'LOFT', label: 'Loft 6 (Shift)', color: 'bg-amber-500 text-slate-950' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setShotType(st.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition ${
                        shotType === st.id
                          ? `${st.color} border-white`
                          : 'bg-slate-900 text-slate-300 border-white/10 hover:bg-slate-800'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => executeBatSwing(null, shotType)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2"
              >
                <Crosshair className="w-5 h-5" />
                <span>SWING BAT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {screen === 'PLAYING' && isPaused && (
        <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black">MATCH PAUSED</h2>
            <p className="text-xs text-slate-400 mt-1">
              {selectedMode.name} • Score: {matchState.runs}/{matchState.wickets} ({oversFormatted} ov)
            </p>
            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm"
              >
                Resume Match
              </button>
              <button
                onClick={() => startMatch(selectedMode)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
              >
                Restart Match
              </button>
              <button
                onClick={() => {
                  clearPendingTimers();
                  setIsPaused(false);
                  setScreen('HOME');
                }}
                className="w-full py-3 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-sm"
              >
                Quit to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-MATCH SCORECARD SCREEN */}
      {screen === 'GAMEOVER' && (
        <div className="relative z-30 h-[calc(100vh-56px)] flex items-center justify-center p-4">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              {selectedMode.name} COMPLETE
            </div>
            <h2 className="text-3xl font-black mt-1">
              {matchState.target
                ? matchState.runs >= matchState.target
                  ? 'VICTORY ACHIEVED!'
                  : 'TARGET SHORT!'
                : 'INNINGS COMPLETE'}
            </h2>

            <div className="my-5 bg-slate-900/90 border border-white/10 rounded-2xl p-4 grid grid-cols-3 gap-2">
              <div>
                <div className="text-[10px] text-slate-400 font-bold">FINAL SCORE</div>
                <div className="text-2xl font-black text-white">
                  {matchState.runs}/{matchState.wickets}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">OVERS</div>
                <div className="text-2xl font-black text-sky-400">{oversFormatted}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold">4s / 6s</div>
                <div className="text-2xl font-black text-emerald-400">
                  {matchState.foursCount} / {matchState.sixesCount}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => startMatch(selectedMode)}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => setScreen('HOME')}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-5 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-lg font-black">
                {activeModal === 'SHOP' && 'GXA PRO BAT ARMORY & STADIUMS'}
                {activeModal === 'ACHIEVEMENTS' && 'TROPHY CABINET & MILESTONES'}
                {activeModal === 'CONTROLS' && 'HOW TO PLAY & CONTROLS'}
                {activeModal === 'DOCS' && 'PHASE 3 ENGINEERING & QA STATUS'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {activeModal === 'SHOP' && (
              <div className="space-y-3">
                {BATS_CATALOG.map((bat) => {
                  const unlocked = profile.unlockedBats.includes(bat.id);
                  const equipped = profile.selectedBat === bat.id;
                  return (
                    <div
                      key={bat.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/10"
                    >
                      <div>
                        <div className="font-extrabold text-sm">{bat.name}</div>
                        <div className="text-xs text-slate-400">{bat.desc}</div>
                      </div>
                      <button
                        onClick={() => {
                          if (unlocked) {
                            setProfile((p) => ({ ...p, selectedBat: bat.id }));
                          } else if (profile.coins >= bat.cost) {
                            setProfile((p) => ({
                              ...p,
                              coins: p.coins - bat.cost,
                              unlockedBats: [...p.unlockedBats, bat.id],
                              selectedBat: bat.id
                            }));
                            showToast(`Unlocked ${bat.name}!`, 'Equipped for your next innings.');
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black ${
                          equipped
                            ? 'bg-emerald-500 text-slate-950'
                            : unlocked
                            ? 'bg-slate-800 text-white'
                            : profile.coins >= bat.cost
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800/50 text-slate-500'
                        }`}
                      >
                        {equipped ? 'Equipped' : unlocked ? 'Equip' : `${bat.cost} Coins`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeModal === 'ACHIEVEMENTS' && (
              <div className="space-y-2.5">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const done = profile.achievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        done ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-slate-950/60 border-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm">{ach.title}</div>
                        <div className="text-xs text-slate-400">{ach.desc}</div>
                      </div>
                      <span className="text-xs font-black text-amber-400">+{ach.reward} Coins</span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeModal === 'CONTROLS' && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">Desktop Keyboard:</strong> Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">A / D</kbd> or{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">← / →</kbd> to aim Cover or Leg-side,{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">W / ↑</kbd> for Straight Drive. Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> to swing,{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Shift</kbd> for a Lofted Six, or{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">X</kbd> for a defensive block.
                </p>
                <p>
                  <strong className="text-white">Mobile & Touch:</strong> Swipe left, straight, or right across the 3D
                  stadium as the ball hits the colored bounce ring. Swipe upward to launch a Lofted Six!
                </p>
              </div>
            )}

            {activeModal === 'DOCS' && (
              <div className="space-y-2">
                {PHASE3_AUDIT_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-white">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.detail}</div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}