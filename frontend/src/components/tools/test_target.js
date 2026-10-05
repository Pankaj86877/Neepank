function testTargetSearch(targetKb, getSizeBytesForQuality) {
       let minQ = 0.1;
       let maxQ = 0.95;
       let currentQ = 0.95;
       let bestUrl = "best_url";
       let bestSize = Infinity;
       let closestValidUrl = "";
       let iters = 0;
       const targetBytes = targetKb * 1024;
       
       while (iters < 8 && minQ <= maxQ) {
         iters++;
         const sizeBytes = getSizeBytesForQuality(currentQ);
         console.log(`Iter ${iters}: currentQ = ${currentQ.toFixed(3)}, size = ${(sizeBytes/1024).toFixed(1)} KB`);
         
         if (sizeBytes <= targetBytes) {
           closestValidUrl = "closest_" + currentQ;
           minQ = currentQ + 0.05;
         } else {
           maxQ = currentQ - 0.05;
         }
         
         if (sizeBytes < bestSize) {
           bestSize = sizeBytes;
           bestUrl = "best_" + currentQ;
         }
         currentQ = (minQ + maxQ) / 2;
       }
       
       return closestValidUrl || bestUrl;
}

// simulate quality to size: size = quality * 2000 KB
console.log("Result:", testTargetSearch(500, q => q * 2000 * 1024));
