import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validatePost,validateId} from './validation.mjs';
const sample=()=>({caption:'Useful tips',slides:[{title:'A',body:'B'},{title:'C',body:'D'}]});
test('accepts post and fixes slide order',()=>assert.deepEqual(validatePost(sample()).slides.map(s=>s.number),[1,2]));
test('rejects missing or oversized caption',()=>{assert.throws(()=>validatePost({...sample(),caption:''}));assert.throws(()=>validatePost({...sample(),caption:'a'.repeat(2201)}));});
test('rejects invalid slide counts and body types',()=>{assert.throws(()=>validatePost({...sample(),slides:[]}));let p=sample();p.slides[0].body={};assert.throws(()=>validatePost(p));});
test('rejects filesystem traversal in post ID',()=>assert.throws(()=>validateId('../output')));
