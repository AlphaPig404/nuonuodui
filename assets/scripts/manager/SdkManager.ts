import { sys } from "cc";
import AudioManager from "./AudioManager";

export default class SdkManager {
    public static _instance: SdkManager = null

    public static get instance() {
        if (null == this._instance) {
            this._instance = new SdkManager();
        }
        return this._instance
    }

    shareTitle: string = '好玩上头的游戏，你敢接受挑战吗？'
    shareImg: string = ''
    // 激励视频
    videoId: string = 'adunit-3619e383547893df'
    private videoAd = null
    // 插屏
    interstitialId: string = 'adunit-f87ad30d987e6c63'
    private interstitialAd = null
    // 横幅
    bannerId: string = 'adunit-3d1ef010ed4fc290'
    private bannerAd = null
    // 原生格子: 横向（后台90%显示）
    customRowId: string = ''
    private customRowAd = null
    // 原生格子: 纵向（后台90%显示）
    customColId: string = ''
    private customColAd = null
    // 抖音录屏
    videoRecorder: any = null; // 录制器
    videoRecordState: number = 0; // 录制状态
    videoStartTime: number = null; // 录制起始时间
    videoRecordTime: number = 120; // 视频录制时长
    videoPath: string = null; // 录制所得视频地址
    videoIsExist: number = 0; // 视频是否存在, 默认存在
    videoTopics: string[] = []

    // 获取平台
    getPlatform() {
        let platform = null
        if (sys.platform == sys.Platform.WECHAT_GAME) {
            platform = window['wx']
        } else if (sys.platform == sys.Platform.BYTEDANCE_MINI_GAME) {
            platform = window['tt']
        }
        return platform
    }

    // 主动分享
    // query: string (eg: key1=val1&key2=val2)
    activeShare(options: { title?: string, imageUrl?: string, query?: string } = { title: '', imageUrl: '', query: '' }) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【主动分享】仅支持小游戏平台!')
            return
        }
        options.title = options.title || this.shareTitle
        options.imageUrl = options.imageUrl || this.shareImg
        platform.shareAppMessage(options);
    }

    // 被动分享
    passiveShare(options: { title?: string, imageUrl?: string, query?: string } = { title: '', imageUrl: '', query: '' }) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【被动分享】仅支持小游戏平台!')
            return
        }
        platform.showShareMenu({
            success: (res: any) => { },
            fail: (res: any) => { }
        });
        options.title = options.title || this.shareTitle
        options.imageUrl = options.imageUrl || this.shareImg
        platform.onShareAppMessage(() => {
            return options
        });
    }

    // 获取分享参数
    getShareQuery(key: string) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【分享参数获取】仅支持小游戏平台!')
            return
        }
        const options = platform.getLaunchOptionsSync()
        const query = options.query
        let data = null
        if (query && query[key]) {
            data = query[key]
        }
        return data
    }

    // 跳转
    turnToApp(appId: string) {
        if (appId == '') return
        const platform = this.getPlatform()
        if (!platform) {
            this.turnToBrowser(appId)
            return
        }
        platform.navigateToMiniProgram({
            appId: appId
        });
    }

    // 浏览器跳转
    turnToBrowser(url: string) {
        window.open(url)
    }

    // 监听音频中断（微信）
    initAudioEndListener() {
        if (typeof window['wx'] === 'undefined') {
            console.log('【音频中断监听】仅支持微信平台!')
            return
        }
        window['wx'].onAudioInterruptionEnd(() => {
            console.log('音频中断，恢复播放')
            AudioManager.instance.playMusic()
        })
    }

    // 初始化横幅
    initBannerAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【流量主横幅初始化】仅支持小游戏平台!')
            return
        }
        if (this.bannerId == '') {
            console.log('【流量主】请配置横幅广告ID')
            return
        }
        let winSize = platform.getSystemInfoSync();
        if (this.bannerAd == null) {
          try{
            this.bannerAd = platform.createBannerAd({
              adUnitId: this.bannerId,
              adIntervals: 30,
              style: {
                  height: winSize.windowHeight - 80,
                  left: 0,
                  top: 500,
                  width: winSize.windowWidth
              }
          });
          this.bannerAd.onResize((res: any) => {
              this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
              this.bannerAd.style.left = winSize.windowWidth / 2 - this.bannerAd.style.realWidth / 2;
          });
          this.bannerAd.onError((err: any) => {
              console.error('【流量主横幅】初始化有误', err)
          });
        }catch(e){
            console.log('log:::e', e)
        }
            
      }
    }

    // 横幅展示
    toggleBannerAd(isShow: boolean) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log(`【流量主横幅:${isShow}】仅支持小游戏平台!`)
            return
        }
        if (this.bannerAd) {
            isShow ? this.bannerAd.show() : this.bannerAd.hide();
        }
    }

    // 初始化插屏
    initInterstitialAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【流量主插屏初始化】仅支持小游戏平台!')
            return
        }
        if (this.interstitialId == '') {
            console.log('【流量主】请配置插屏广告ID')
            return
        }
        if (this.interstitialAd == null) {
            this.interstitialAd = platform.createInterstitialAd({
                adUnitId: this.interstitialId
            });
            this.interstitialAd.onError((err: any) => {
                console.error('【流量主插屏】初始化有误')
            });
        }
    }

    // 插屏展示
    showInterstitialAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【流量主插屏】仅支持小游戏平台!')
            return
        }
        if (this.interstitialAd) {
            this.interstitialAd.show().catch((err: any) => {
                console.error('【流量主插屏】加载失败')
            });
        }
    }

    // 初始化激励
    initVideoAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【流量主激励初始化】仅支持小游戏平台!')
            return
        }
        if (this.videoId == '') {
            console.log('【流量主】请配置激励视频广告ID')
            return
        }
        if (this.videoAd == null) {
            this.videoAd = platform.createRewardedVideoAd({
                adUnitId: this.videoId
            });
            this.videoAd.onError((err: any) => {
                console.error('【流量主激励】初始化有误')
            });
        }
    }

    // 激励展示
    showVideoAd(success: any, fail?: any) {
        const platform = this.getPlatform()
        if (!platform) {
            // console.log('激励模拟成功')
            return success && success('模拟成功，激励奖励已发放')
        }
        if (this.videoAd) {
            this.videoAd.offClose();
            this.videoAd.onClose((res: any) => {
                this.videoAd.offClose();
                if (res && res.isEnded || res === undefined) {
                    return success && success('激励奖励已发放')
                } else {
                    return fail && fail('视频播放中断')
                }
            });
            this.videoAd.show().catch(() => {
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch((err: any) => {
                        console.log('广告展示失败')
                    })
            });
        } else {
            // console.log('激励模拟成功')
            return fail && fail('该功能尚未开放')
        }
    }

    // 初始化横向格子
    initCustomRowAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【横向格子初始化】仅支持小游戏平台!')
            return
        }
        if (this.customRowId == '') {
            console.log('【流量主】请配置横向格子广告ID')
            return
        }
        let winSize = platform.getSystemInfoSync();
        if (this.customRowAd == null) {
            this.customRowAd = platform.createCustomAd({
                adUnitId: this.customRowId,
                style: {
                    width: 320,
                    left: (winSize.screenWidth - 320) / 2,
                    top: winSize.screenHeight - 100,
                    fixed: 0
                }
            })
            this.customRowAd.onError((err: any) => {
                console.error('【流量主横向格子】初始化有误')
            });
        }
    }

    // 横向格子广告展示
    toggleCustomRowAd(isShow: boolean = true) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log(`【流量主横向格子:${isShow}】仅支持小游戏平台!`)
            return
        }
        if (this.customRowAd) isShow ? this.customRowAd.show() : this.customRowAd.hide();
    }

    // 初始化纵向格子
    initCustomColAd() {
        const platform = this.getPlatform()
        if (!platform) {
            console.log('【纵向格子初始化】仅支持小游戏平台!')
            return
        }
        if (this.customColId == '') {
            console.log('【流量主】请配置纵向格子广告ID')
            return
        }
        let winSize = platform.getSystemInfoSync();
        if (this.customColAd == null) {
            this.customColAd = platform.createCustomAd({
                adUnitId: this.customColId,
                style: {
                    width: 150,
                    left: winSize.screenWidth - 30,
                    top: (winSize.screenHeight - 380) / 2,
                    fixed: 0
                }
            })
            this.customColAd.onError((err: any) => {
                console.error('【流量主纵向格子】初始化有误')
            });
        }
    }

    // 横向格子广告展示
    toggleCustomColAd(isShow: boolean = true) {
        const platform = this.getPlatform()
        if (!platform) {
            console.log(`【流量主纵向格子:${isShow}】仅支持小游戏平台!`)
            return
        }
        if (this.customColAd) isShow ? this.customColAd.show() : this.customColAd.hide();
    }

    // 获取排行榜
    getRank() {
        if (typeof window['wx'] === 'undefined') {
            console.log('【获取排名】仅支持微信平台!')
            return
        }
        window['wx'].postMessage({
            event: 'getRank'
        })
    }

    /**
     * 设置排名
     * @param data 关卡数
     */
    setRank(data: number) {
        if (typeof window['wx'] === 'undefined') {
            console.log('【设置排名】仅支持微信平台!', data)
            return
        }
        window['wx'].postMessage({
            event: 'setScore',
            score: data
        })
    }

    // 录制视频开始
    recordingVideoStart() {
        if (typeof window['tt'] === 'undefined') {
            console.log('【录屏功能】仅支持抖音平台!')
            return
        }
        this.videoRecorder = window['tt'].getGameRecorderManager();
        this.videoRecordState = 1;
        this.videoIsExist = 0;
        this.videoStartTime = Date.parse(new Date().toString())
        // 开始回调
        this.videoRecorder.onStart((res: any) => {
            //console.log('录屏开始');
            //console.log(res);
        });
        // 开始
        this.videoRecorder.start({
            duration: this.videoRecordTime, // 录制时长
        });
        // 录制结束回调
        this.videoRecorder.onStop((res: any) => {
            this.videoRecordState = 2;
            this.videoPath = res.videoPath;
            //console.log('录屏结束', this.videoPath)
        });
        // 录制错误回调
        this.videoRecorder.onError((res: any) => {
            //console.log("录屏error", res)
        });
    }

    // 录制视频结束
    recordingVideoEnd() {
        if (typeof window['tt'] === 'undefined') {
            console.log('【录屏功能】仅支持抖音平台!')
            return
        }
        if (this.videoRecorder) {
            const endTime = Date.parse(new Date().toString())
            if ((endTime - this.videoStartTime) / 1000 <= 5) {
                this.videoIsExist = 1;
            } else {
                this.videoIsExist = 0;
            }
            this.videoRecorder.stop();
        }
    }

    /**
    * 录制视频分享
    * 参数1 成功回调
    * 参数2 失败回调
    */
    recordingVideoShare(success: any, fail?: any) {
        if (typeof window['tt'] === 'undefined') {
            console.log('【录屏功能】仅支持抖音平台!')
            return
        }
        if (this.videoIsExist == 1) {
            console.log('录制时间过短')
            return;
        }
        this.videoRecordState = 3;
        window['tt'].shareAppMessage({
            channel: 'video',
            title: '',
            imageUrl: '',
            query: '',
            extra: {
                videoPath: this.videoPath, // 可用录屏得到的视频地址
                videoTopics: this.videoTopics,
                createChallenge: true
            },
            success() {
                success && success()
            },
            fail(err: any) {
                fail && fail()
            }
        })
    }

    // 录屏是否存在
    isVideoExist() {
        return this.videoIsExist
    }
}

