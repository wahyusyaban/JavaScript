// --- FUNGSI GLOBAL (Galeri) ---
let slideIndex = 1;
window.plusSlides = function(n) {
    let slides = document.getElementsByClassName("mySlides");
    if(slides.length === 0) return;
    slideIndex += n;
    if (slideIndex > slides.length) slideIndex = 1;
    if (slideIndex < 1) slideIndex = slides.length;
    for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";
    slides[slideIndex-1].style.display = "block";
};

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. SKRIP OPINI (Eksekusi Instan) ---
    function initOpini() {
        let breadcrumb = document.querySelector('.breadcrumb');
        let tagContainer = document.querySelector('.tag_container');
        if ((breadcrumb && breadcrumb.textContent.includes('Opini')) || (tagContainer && tagContainer.textContent.includes('Opini'))) {
            
            document.querySelectorAll('span').forEach(el => {
                if (el.children.length === 0 && el.textContent.includes('Ringkasan Berita')) {
                    el.textContent = el.textContent.replace(/Ringkasan Berita/g, 'Ringkasan Opini');
                }
            });

            let profileTable = document.querySelector('.post_body table');
            if (!profileTable) return;
            
            let dataCell = profileTable.querySelector('td:nth-child(2)');
            if (dataCell) {
                let textDivs = dataCell.querySelectorAll('div');
                if (textDivs.length >= 2) {
                    let nama = textDivs[0].textContent.trim().replace(/^Oleh:\s*/i, '');
                    let jabatan = textDivs[1].textContent.trim();
                    let targetName = document.querySelector('.post_author__name');
                    if (targetName) {
                        targetName.innerHTML = `<div style="font-weight:bold; color: #000;">${nama}</div><div style="font-weight:normal; color:#555;">${jabatan}</div>`;
                    }
                }
            }
            let sourceImg = profileTable.querySelector('td img');
            let targetAvatar = document.querySelector('.post_author__avatar');
            if (sourceImg && targetAvatar) {
                let imgSrc = sourceImg.getAttribute('src');
                let targetImg = targetAvatar.querySelector('img');
                if (targetImg) {
                    targetImg.setAttribute('src', imgSrc);
                    targetImg.removeAttribute('srcset');
                    targetImg.removeAttribute('data-src');
                } else {
                    targetAvatar.innerHTML = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover;" />`;
                }
            }
            profileTable.style.display = 'none';
        }
    }
    initOpini();

    // --- 2. SKRIP GALERI (Eksekusi Instan) ---
    let slides = document.getElementsByClassName("mySlides");
    if (slides.length > 0) {
        let total = slides.length;
        for (let i = 0; i < total; i++) {
            let numDiv = slides[i].querySelector(".numbertext");
            if (numDiv) numDiv.innerHTML = (i + 1) + " / " + total;
            slides[i].style.display = i === 0 ? "block" : "none";
        }
    }

    // --- 3. SKRIP READ ALOUD / AUDIO (Eksekusi Instan) ---
    function initReadAloud() {
        const btnPlay = document.getElementById('btn-read-aloud');
        const iconContainer = document.querySelector('.audio-icon');
        const progressBar = document.getElementById('audio-progress-bar');
        const timeCurrentLabel = document.getElementById('audio-time-current');
        const timeTotalLabel = document.getElementById('audio-time-total');
        const btnSpeed = document.getElementById('btn-speed');
        const contentContainer = document.querySelector('.post_content');

        if (btnPlay && contentContainer) {
            const playIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" /></svg>`;
            const pauseIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>`;

            let selectedVoice = null;

            function loadVoices() {
                const voices = window.speechSynthesis.getVoices();
                const idVoices = voices.filter(v => v.lang.includes('id') || v.lang.includes('ID'));

                if (idVoices.length > 0) {
                    const maleVoice = idVoices.find(v => v.name.toLowerCase().includes('andika') || v.name.toLowerCase().includes('male'));
                    selectedVoice = maleVoice ? maleVoice : idVoices[0];
                }
            }

            loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }

            const targetElements = contentContainer.querySelectorAll('p, li, blockquote');
            let fullText = '';

            targetElements.forEach(el => {
                if (!el.parentElement.closest('p, li, blockquote')) {
                    fullText += el.innerText + '. '; 
                }
            });

            fullText = fullText.replace(/\s+/g, ' ').trim();
            if (fullText === '') return;

            const words = fullText.split(/\s+/).length;
            let readingRate = 1.0;
            let baseTotalSeconds = Math.round((words / 130) * 60);

            function formatTime(seconds) {
                const m = Math.floor(seconds / 60).toString().padStart(2, '0');
                const s = Math.floor(seconds % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            }

            if(timeTotalLabel) timeTotalLabel.innerText = formatTime(baseTotalSeconds);

            let isPlaying = false;
            let isPaused = false;
            let progressInterval;
            let elapsedSeconds = 0;
            let lastTick = 0;

            function resetAudioUI() {
                isPlaying = false;
                isPaused = false;
                if(iconContainer) iconContainer.innerHTML = playIcon;
                if(progressBar) progressBar.style.width = '0%';
                if(timeCurrentLabel) timeCurrentLabel.innerText = '00:00';
                elapsedSeconds = 0;
                clearInterval(progressInterval);
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            }

            function startTimer() {
                clearInterval(progressInterval); 
                lastTick = Date.now();
                progressInterval = setInterval(() => {
                    let now = Date.now();
                    let delta = (now - lastTick) / 1000;
                    lastTick = now;
                    elapsedSeconds += delta;
                    let adjustedTotalSeconds = Math.round(baseTotalSeconds / readingRate);
                    
                    if (elapsedSeconds >= adjustedTotalSeconds) {
                        elapsedSeconds = adjustedTotalSeconds;
                        clearInterval(progressInterval);
                    }
                    
                    if(timeCurrentLabel) timeCurrentLabel.innerText = formatTime(elapsedSeconds);
                    let percentage = (elapsedSeconds / adjustedTotalSeconds) * 100;
                    if(progressBar) progressBar.style.width = (percentage > 100 ? 100 : percentage) + '%';
                }, 100);
            }

            function playTextChunk(text) {
                window.speechUtterance = new SpeechSynthesisUtterance(text);
                window.speechUtterance.lang = 'id-ID';
                window.speechUtterance.rate = readingRate;
                
                if (selectedVoice) {
                    window.speechUtterance.voice = selectedVoice;
                }

                window.speechUtterance.onend = function() {
                    if (!isPaused && isPlaying) resetAudioUI();
                };
                window.speechUtterance.onerror = function(event) {
                    if (event.error !== 'canceled' && !isPaused) resetAudioUI();
                };

                window.speechSynthesis.speak(window.speechUtterance);
                startTimer();
            }

            if ('speechSynthesis' in window) window.speechSynthesis.cancel();

            const speeds = [1.0, 1.25, 1.5, 0.75];
            let speedIndex = 0;

            if (btnSpeed) {
                btnSpeed.addEventListener('click', function() {
                    speedIndex = (speedIndex + 1) % speeds.length;
                    readingRate = speeds[speedIndex];
                    btnSpeed.innerText = readingRate + 'x';
                    if(timeTotalLabel) timeTotalLabel.innerText = formatTime(Math.round(baseTotalSeconds / readingRate));

                    if (isPlaying && !isPaused) {
                        window.speechSynthesis.cancel();
                        clearInterval(progressInterval);
                        let percentageDone = elapsedSeconds / (baseTotalSeconds / speeds[(speedIndex - 1 + speeds.length) % speeds.length]);
                        let startCharIndex = Math.round(percentageDone * fullText.length);
                        playTextChunk(fullText.substring(startCharIndex));
                    }
                });
            }

            btnPlay.addEventListener('click', function() {
                if (!('speechSynthesis' in window)) return alert('Browser Anda tidak mendukung Web Speech API.');

                if (isPlaying && !isPaused) {
                    isPaused = true;
                    clearInterval(progressInterval);
                    window.speechSynthesis.cancel(); 
                    if(iconContainer) iconContainer.innerHTML = playIcon;
                    return;
                }

                if (isPlaying && isPaused) {
                    isPaused = false;
                    if(iconContainer) iconContainer.innerHTML = pauseIcon;
                    let adjustedTotalSeconds = Math.round(baseTotalSeconds / readingRate);
                    let startCharIndex = Math.round((elapsedSeconds / adjustedTotalSeconds) * fullText.length);
                    playTextChunk(fullText.substring(startCharIndex));
                    return;
                }

                isPlaying = true;
                isPaused = false;
                elapsedSeconds = 0;
                if(iconContainer) iconContainer.innerHTML = pauseIcon;
                
                if (!selectedVoice) loadVoices(); 
                
                playTextChunk(fullText);
            });

            window.addEventListener('beforeunload', function() {
                window.speechSynthesis.cancel();
            });
        }
    }
    initReadAloud(); // Panggil fungsi audio segera

    // --- 4. SKRIP AUTO LINKER (Ditunda agar load halaman utama tidak nge-lag) ---
    function initAutoLink() {
        const postBody = document.querySelector('.post_content');
        if (!postBody) return;
        
        const keywords = [
            { word: "bencana", url: "/search/label/Bencana" }, { word: "budaya", url: "/search/label/Budaya%20%26%20Pariwisata" },
            { word: "pariwisata", url: "/search/label/Budaya%20%26%20Pariwisata" }, { word: "ekonomi", url: "/search/label/Ekonomi%20%26%20Bisnis" },
            { word: "bisnis", url: "/search/label/Ekonomi%20%26%20Bisnis" }, { word: "hukum", url: "/search/label/Hukum%20%26%20Kriminal" },
            { word: "kriminal", url: "/search/label/Hukum%20%26%20Kriminal" }, { word: "kesehatan", url: "/search/label/Kesehatan" },
            { word: "korupsi", url: "/search/label/Korupsi" }, { word: "lingkungan", url: "/search/label/Lingkungan" },
            { word: "olahraga", url: "/search/label/Olahraga" }, { word: "opini", url: "/search/label/Opini" },
            { word: "pemerintahan", url: "/search/label/Pemerintahan" }, { word: "politik", url: "/search/label/Politik" },
            { word: "sosial", url: "/search/label/Sosial" }, { word: "Kabupaten Bima", url: "/search/label/Bima" },
            { word: "Kota Bima", url: "/search/label/Kota%20Bima" }, { word: "Dompu", url: "/search/label/Dompu" },
            { word: "Sumbawa", url: "/search/label/Sumbawa" }, { word: "Sumbawa Barat", url: "/search/label/Sumbawa" },
            { word: "Sumbawa", url: "/search/label/Sumbawa Barat" }, { word: "Sumbawa Barat", url: "/search/label/Sumbawa%20Barat" },
            { word: "Lombok Timur", url: "/search/label/Lombok%20Timur" }, { word: "Lombok Tengah", url: "/search/label/Lombok%20Tengah" },
            { word: "Lombok Barat", url: "/search/label/Lombok%20Barat" }, { word: "Kota Mataram", url: "/search/label/Kota%20Mataram" },
            { word: "Lombok Utara", url: "/search/label/Lombok%20Utara" }
        ].map(k => ({ ...k, regex: new RegExp('\\b(' + k.word + ')\\b', 'i') })); 

        const usedUrls = new Set();
        postBody.querySelectorAll('p').forEach(p => {
            const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.parentNode.tagName !== 'A') nodesToReplace.push(node);
            }
            nodesToReplace.forEach(node => {
                let text = node.nodeValue;
                keywords.forEach(item => {
                    if (usedUrls.has(item.url)) return;
                    if (item.regex.test(text)) {
                        const span = document.createElement('span');
                        span.innerHTML = text.replace(item.regex, `<a href="${item.url}">$1</a>`);
                        if (node.parentNode) {
                            node.parentNode.replaceChild(span, node);
                            usedUrls.add(item.url);
                        }
                    }
                });
            });
        });
    }

    // --- 5. SKRIP SUMMARY AI (Ditunda agar tidak memblokir render UI) ---
    function initSummary() {
        let h1 = document.querySelector('h1') || document.querySelector('.post-title, .entry-title');
        let judulArtikel = h1 ? h1.innerText.trim() : "";

        if (judulArtikel !== "") {
            let widget = document.getElementById("gs-auto-widget");
            if(widget) widget.style.display = "block";
            
            fetch(`https://script.google.com/macros/s/AKfycbwWIDHgvg3zhUErD5DvOX8H1LwNLp_KN4fNRi_LZVRwZLtCOtzWRFgSv4_sn-e8tHXArA/exec?judul=${encodeURIComponent(judulArtikel)}`)
            .then(res => res.json())
            .then(data => {
                if (data.ringkasan && data.ringkasan !== "Tidak ditemukan") {
                    let teks = data.ringkasan;
                    if (!teks.includes('<li') && teks.includes('\n')) {
                        teks = '<ul>' + teks.split('\n').filter(i => i.trim() !== '').map(i => `<li>${i.trim()}</li>`).join('') + '</ul>';
                    } else if (!teks.includes('<ul')) {
                        teks = `<ul><li>${teks.trim()}</li></ul>`;
                    }
                    let loader = document.getElementById("gs-skeleton-loader");
                    if(loader) loader.style.display = "none";
                    
                    let resultBox = document.getElementById("hasilPencarianSheet");
                    if(resultBox) {
                        resultBox.innerHTML = teks;
                        resultBox.style.display = "block";
                    }
                } else {
                    if(widget) widget.style.display = "none";
                }
            }).catch(() => { if(widget) widget.style.display = "none"; });
        }
    }

    // Tunda eksekusi skrip berat agar prioritas utama adalah menampilkan konten ke user.
    setTimeout(initAutoLink, 100); 
    setTimeout(initSummary, 200); 

});
