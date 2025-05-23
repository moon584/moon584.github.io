document.addEventListener('DOMContentLoaded', function () {
    // 初始化粒子特效
    if (typeof particlesJS === 'function') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80 },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5 },
                size: { value: 3 },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: "none"
                }
            },
            interactivity: {
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            }
        });
    } else {
        console.warn('未加载 particles.js 库，粒子特效不可用');
    }

    // 改进的鼠标移动特效
    const container = document.querySelector('.container');
    let ticking = false; // 用于节流
    
    // 添加移动处理
    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // 修正鼠标离开容器时的复位
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });

    // 音频控制
    const audio = document.getElementById('bgm');
    const audioButton = document.querySelector('.audio-control');
    const audioOnIcon = document.querySelector('.audio-on');
    const audioOffIcon = document.querySelector('.audio-off');
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeOn = document.querySelector('.volume-on');
    const volumeOff = document.querySelector('.volume-off');

    // 初始化音量
    const storedVolume = localStorage.getItem('pageVolume');
    audio.volume = storedVolume ? parseFloat(storedVolume) : 1;
    volumeSlider.value = audio.volume;

    // 更新音量图标状态
    function updateVolumeIcon() {
        if (audio.volume === 0 || audio.muted) {
            volumeOn.style.display = 'none';
            volumeOff.style.display = 'block';
        } else {
            volumeOn.style.display = 'block';
            volumeOff.style.display = 'none';
        }
    }

    // 音量滑块事件
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        audio.volume = volume;
        localStorage.setItem('pageVolume', volume);
        updateVolumeIcon();
    });

    // 静音切换
    volumeIcon.addEventListener('click', () => {
        audio.muted = !audio.muted;
        volumeSlider.disabled = audio.muted;
        updateVolumeIcon();
    });

    // 音量条过渡动画
    volumeSlider.addEventListener('mousedown', () => {
        volumeSlider.style.transition = 'none';
    });
    volumeSlider.addEventListener('mouseup', () => {
        volumeSlider.style.transition = 'all 0.3s';
    });

    // 改进音频自动播放尝试
    let hasInteracted = false;
    
    // 获取之前存储的音频状态
    const audioWasPlaying = localStorage.getItem('audioPlaying') === 'true';
    
    // 设置初始UI状态
    if (audioWasPlaying) {
        // 如果之前是播放状态，等待用户交互后尝试播放
        audioButton.classList.add('muted');
        audioOnIcon.style.display = 'none';
        audioOffIcon.style.display = 'block';
    } else {
        // 默认显示为暂停状态
        audioButton.classList.add('muted');
        audioOnIcon.style.display = 'none';
        audioOffIcon.style.display = 'block';
    }
    
    // 标记用户交互
    document.addEventListener('click', function() {
        hasInteracted = true;
        
        // 如果音频按钮显示为静音状态但用户已交互且之前在播放
        if (audioButton.classList.contains('muted') && hasInteracted && audioWasPlaying) {
            audio.play().then(() => {
                audioOnIcon.style.display = 'block';
                audioOffIcon.style.display = 'none';
                audioButton.classList.remove('muted');
            }).catch(error => console.error('播放失败:', error));
        }
    }, { once: true }); // 仅执行一次

    // 显示首次播放提示，添加过渡效果
    const showPlayHint = () => {
        // 如果是首次加载页面且未交互过
        if (!localStorage.getItem('hasVisited') && !hasInteracted) {
            const hint = document.createElement('div');
            hint.className = 'play-hint';
            hint.textContent = '点击页面任意位置开启背景音乐';
            hint.style = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 10px 15px; border-radius: 20px; font-size: 14px; z-index: 10; transition: opacity 0.5s ease;';
            document.body.appendChild(hint);
            
            // 确保元素渲染后再设置过渡效果
            setTimeout(() => {
                hint.style.opacity = '1';
            }, 10);
            
            // 3秒后平滑淡出
            setTimeout(() => hint.style.opacity = '0', 3000);
            setTimeout(() => hint.remove(), 3500);
            
            localStorage.setItem('hasVisited', 'true');
        }
    };
    
    // 页面加载2秒后显示提示
    setTimeout(showPlayHint, 2000);
    
    // 点击切换状态，并保存到localStorage
    audioButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                audioOnIcon.style.display = 'block';
                audioOffIcon.style.display = 'none';
                audioButton.classList.remove('muted');
                localStorage.setItem('audioPlaying', 'true');
            }).catch(error => console.error('播放失败:', error));
        } else {
            audio.pause();
            audioOnIcon.style.display = 'none';
            audioOffIcon.style.display = 'block';
            audioButton.classList.add('muted');
            localStorage.setItem('audioPlaying', 'false');
        }
    });

    // 悬停提示
    audioButton.addEventListener('mouseenter', () => {
        audioButton.setAttribute('title',
            audio.paused ? '点击播放背景音效' : '点击暂停背景音效');
    });
    
    // 初始化调用一次更新图标
    updateVolumeIcon();
    
    // 添加触摸设备支持
    if ('ontouchstart' in window) {
        // 为触摸设备禁用鼠标移动效果
        document.removeEventListener('mousemove', () => {});
        container.removeEventListener('mouseleave', () => {});
    }
});