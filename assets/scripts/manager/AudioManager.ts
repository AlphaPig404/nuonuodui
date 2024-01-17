import { AudioSource } from 'cc';
import { ENUM_AUDIO_CLIP } from './../Enum';
import DataManager from './DataManager';
import ResourceManager from "./ResourceManager"

export default class AudioManager {
    private audioSource: AudioSource = null
    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
            this._instance.init()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<AudioManager>()
    }

    init(){
        this.audioSource = new AudioSource()
        this.audioSource.loop = true
        this.audioSource.volume = 0.3
    }

    async playMusic(){
        if(!DataManager.instance.isMusicOn) return
        if(this.audioSource.clip){
            this.audioSource.play()
            return
        }
        const clip = await ResourceManager.instance.getClip(ENUM_AUDIO_CLIP.BGM)
        this.audioSource.clip = clip
        this.audioSource.play()
    }

    stopMusic(){
        this.audioSource.stop()
    }

    async playSound(name: ENUM_AUDIO_CLIP | string){
        if(!DataManager.instance.isSoundOn) return
        const clip = await ResourceManager.instance.getClip(name)
        return this.audioSource.playOneShot(clip, this.audioSource.volume)
    }

    stopSound(audioId: number){
      
    }
}
