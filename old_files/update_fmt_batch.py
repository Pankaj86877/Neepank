import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. HTML changes
# Update file input to have multiple
content = content.replace('<input type="file" id="fmt-file-input" accept="image/*">', '<input type="file" id="fmt-file-input" accept="image/*" multiple>')
content = content.replace('<div class="dz-label">Drop an image or click to browse</div>', '<div class="dz-label">Drop image(s) or click to browse</div>')

# Replace preview panel with file list container
preview_regex = r'<div class="format-preview-grid".*?</div>\s*</div>\s*</div>'
replacement_html = """<div class="file-list" id="fmt-file-list" style="margin-top:16px;">
                        <!-- Uploaded files will appear here -->
                    </div>
                </div>"""
content = re.sub(preview_regex, replacement_html, content, flags=re.DOTALL)

# Also update the title
content = content.replace('span class="card-title" style="color:var(--color-orange);">Source Image</span>', 'span class="card-title" style="color:var(--color-orange);">Source Images</span>')

# 2. JS class replacement
old_js_regex = r'class FormatConverterTool \{.*?\}(?=\s*class PdfConverterTool)'

new_js = """class FormatConverterTool {
        constructor() {
            this.img = null;
            this.files = []; /* Array of { file, img, url, width, height } */
            this.outFormat = 'image/png';
            this.outExt = 'png';
            this.initDOM();
            this.initEvents();
        }

        initDOM() {
            this.dzZone = document.getElementById('fmt-dz-zone');
            this.fileInput = document.getElementById('fmt-file-input');
            
            this.fileList = document.getElementById('fmt-file-list');
            this.srcDims = document.getElementById('fmt-src-dims');
            
            this.fmtBtns = document.querySelectorAll('#fmt-format-btns button');
            this.btnSvg = document.getElementById('fmt-btn-svg');
            this.fmtBtnsContainer = document.getElementById('fmt-format-btns');
            this.qualityRange = document.getElementById('fmt-quality-range');
            this.qualityVal = document.getElementById('fmt-quality-val');
            
            this.resizeW = document.getElementById('fmt-resize-w');
            this.resizeH = document.getElementById('fmt-resize-h');
            this.lockAR = document.getElementById('fmt-lock-ar');
            this.bgColor = document.getElementById('fmt-bg-color');
            
            this.btnConvert = document.getElementById('fmt-convert-btn');
            this.btnClear = document.getElementById('fmt-clear-btn');
            this.statusChip = document.getElementById('fmt-status-chip');
            
            this.progressWrap = document.getElementById('fmt-progress-wrap');
            this.progressFill = document.getElementById('fmt-progress-fill');
        }

        initEvents() {
            this.dzZone.addEventListener('dragover', e => { e.preventDefault(); this.dzZone.classList.add('drag-over'); });
            this.dzZone.addEventListener('dragleave', () => this.dzZone.classList.remove('drag-over'));
            this.dzZone.addEventListener('drop', e => {
                e.preventDefault();
                this.dzZone.classList.remove('drag-over');
                if(e.dataTransfer.files.length) this.handleFiles(e.dataTransfer.files);
            });
            this.fileInput.addEventListener('change', e => {
                if(e.target.files.length) this.handleFiles(e.target.files);
            });

            this.fmtBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.fmtBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.outFormat = btn.dataset.fmt;
                    this.outExt = btn.dataset.ext;
                });
            });

            this.qualityRange.addEventListener('input', e => this.qualityVal.textContent = e.target.value + '%');

            this.resizeW.addEventListener('input', () => {
                // If locking aspect ratio and we have at least one file, base it on the first file's AR
                if(this.lockAR.checked && this.files.length > 0 && this.resizeW.value) {
                    const aspect = this.files[0].height / this.files[0].width;
                    this.resizeH.value = Math.round(this.resizeW.value * aspect);
                }
            });
            this.resizeH.addEventListener('input', () => {
                if(this.lockAR.checked && this.files.length > 0 && this.resizeH.value) {
                    const aspect = this.files[0].width / this.files[0].height;
                    this.resizeW.value = Math.round(this.resizeH.value * aspect);
                }
            });

            this.btnClear.addEventListener('click', () => this.clearAll());
            this.btnConvert.addEventListener('click', () => this.convertAndDownload());
        }

        handleFiles(fileList) {
            let loadPromises = [];
            
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (!file.type.startsWith('image/')) continue;
                
                const promise = new Promise((resolve) => {
                    const url = URL.createObjectURL(file);
                    const img = new Image();
                    img.onload = () => {
                        const fileObj = {
                            id: Date.now().toString() + Math.random().toString().slice(2, 6),
                            file: file,
                            img: img,
                            url: url,
                            width: img.width,
                            height: img.height
                        };
                        this.files.push(fileObj);
                        resolve();
                    };
                    img.src = url;
                });
                loadPromises.push(promise);
            }
            
            Promise.all(loadPromises).then(() => {
                this.renderFileList();
                if(this.files.length > 0) {
                    this.btnConvert.disabled = false;
                    // Auto-fill resize inputs based on first image if empty
                    if (!this.resizeW.value) this.resizeW.value = this.files[0].width;
                    if (!this.resizeH.value) this.resizeH.value = this.files[0].height;
                    
                    this.srcDims.textContent = `${this.files.length} Image(s)`;
                }
            });
            
            this.fileInput.value = '';
        }
        
        renderFileList() {
            this.fileList.innerHTML = '';
            
            if (this.files.length === 0) {
                this.fileList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-on-light-muted);font-size:12px;">No images uploaded</div>`;
                return;
            }
            
            this.files.forEach((fileObj, index) => {
                const item = document.createElement('div');
                item.className = 'file-item';
                item.innerHTML = `
                    <div class="file-item-order">${index + 1}</div>
                    <img src="${fileObj.url}" class="file-item-thumb">
                    <div class="file-item-info">
                        <div class="file-item-name">${fileObj.file.name}</div>
                        <div class="file-item-size">${(fileObj.file.size / 1024).toFixed(1)} KB &nbsp;&bull;&nbsp; ${fileObj.width}×${fileObj.height}</div>
                    </div>
                    <button class="file-item-remove" title="Remove" data-id="${fileObj.id}">✕</button>
                `;
                this.fileList.appendChild(item);
            });
            
            const removeBtns = this.fileList.querySelectorAll('.file-item-remove');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.files = this.files.filter(f => f.id !== id);
                    this.renderFileList();
                    if(this.files.length === 0) {
                        this.btnConvert.disabled = true;
                        this.srcDims.textContent = `—`;
                    } else {
                        this.srcDims.textContent = `${this.files.length} Image(s)`;
                    }
                });
            });
        }

        async processSingleFile(fileObj, canvas, ctx) {
            let targetW = parseInt(this.resizeW.value) || fileObj.width;
            let targetH = parseInt(this.resizeH.value) || fileObj.height;
            
            if (this.outFormat === 'image/svg+xml') {
                const imgd = ctx.getImageData(0, 0, targetW, targetH);
                const options = { ltres: 1, qtres: 1, scale: 1, strokewidth: 1 };
                const quality = parseInt(this.qualityRange.value);
                if (quality < 50) {
                    options.numberofcolors = 8;
                    options.pathomit = 8;
                }
                const svgString = window.ImageTracer ? ImageTracer.imagedataToSVG(imgd, options) : '';
                return { type: 'svg', data: svgString, targetW, targetH };
            } else {
                canvas.width = targetW;
                canvas.height = targetH;

                if (this.outFormat === 'image/jpeg') {
                    ctx.fillStyle = this.bgColor.value;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(fileObj.img, 0, 0, targetW, targetH);

                const quality = parseInt(this.qualityRange.value) / 100;
                const dataUrl = canvas.toDataURL(this.outFormat, quality);
                
                // Convert DataURL to Blob for JSZip
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                
                return { type: 'raster', blob, dataUrl, targetW, targetH };
            }
        }

        async convertAndDownload() {
            if (this.files.length === 0) return;

            this.statusChip.className = 'status-chip processing';
            this.statusChip.textContent = 'Processing...';
            this.progressWrap.style.display = 'block';
            this.progressFill.style.width = '5%';
            this.btnConvert.disabled = true;

            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (this.files.length === 1) {
                    // Direct Download for single file
                    const result = await this.processSingleFile(this.files[0], canvas, ctx);
                    this.progressFill.style.width = '100%';
                    
                    if (result.type === 'svg') {
                        const blob = new Blob([result.data], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `CreativeToolbox_Convert_${result.targetW}x${result.targetH}.svg`;
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                    } else {
                        const link = document.createElement('a');
                        link.download = `CreativeToolbox_Convert_${result.targetW}x${result.targetH}.${this.outExt}`;
                        link.href = result.dataUrl;
                        link.click();
                    }
                } else {
                    // ZIP Download for multiple files
                    const zip = new JSZip();
                    const folder = zip.folder(`CreativeToolbox_Batch_${this.outExt.toUpperCase()}`);
                    
                    for (let i = 0; i < this.files.length; i++) {
                        const fileObj = this.files[i];
                        const result = await this.processSingleFile(fileObj, canvas, ctx);
                        
                        let baseName = fileObj.file.name.substring(0, fileObj.file.name.lastIndexOf('.')) || fileObj.file.name;
                        let fileName = `${baseName}.${this.outExt}`;
                        
                        if (result.type === 'svg') {
                            folder.file(fileName, result.data);
                        } else {
                            folder.file(fileName, result.blob);
                        }
                        
                        let progress = 5 + ((i + 1) / this.files.length) * 80; // up to 85%
                        this.progressFill.style.width = `${progress}%`;
                    }
                    
                    this.statusChip.textContent = 'Zipping...';
                    
                    const zipBlob = await zip.generateAsync({type:"blob"});
                    this.progressFill.style.width = '100%';
                    
                    const url = URL.createObjectURL(zipBlob);
                    const link = document.createElement('a');
                    link.download = `CreativeToolbox_Batch_Convert.zip`;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }

                this.statusChip.className = 'status-chip success';
                this.statusChip.textContent = 'Done';
            } catch (err) {
                console.error(err);
                this.statusChip.className = 'status-chip idle';
                this.statusChip.textContent = 'Error';
            }
            
            setTimeout(() => {
                this.progressWrap.style.display = 'none';
                this.progressFill.style.width = '0%';
                this.btnConvert.disabled = false;
                this.statusChip.className = 'status-chip idle';
                this.statusChip.textContent = 'Ready';
            }, 3000);
        }

        clearAll() {
            this.files.forEach(f => URL.revokeObjectURL(f.url));
            this.files = [];
            this.renderFileList();
            this.srcDims.textContent = '—';
            this.btnConvert.disabled = true;
            this.resizeW.value = '';
            this.resizeH.value = '';
            this.fileInput.value = '';
        }
    }
"""

content = re.sub(old_js_regex, new_js, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)
print("Batch format converter implemented.")
