const videoFetcher = function videoFetcher() {

    return {
        loading: false,
        allVideos: null,
        videoIndex: 0,
        showVideoNumber: -1,
        query: "",
        showMenu: false,
        visualization: window.visualization,
        menuInterval: null,
        perPage: 1,
        currentResolutions: [],
        currentVideoFile: 0,
        showPreferences() {
            console.log(this.visualization)
            window.api.send("toShowPrefs");
        },
        showMenuF() {

            this.showMenu = true;
            let self = this;
            if (this.menuInterval != null) clearInterval(this.menuInterval);
            this.menuInterval = setInterval(function () {
                if (self.query === "" && self.showMenu) {
                    window.api.send("toShowMenu");
                }
            }, 5000);
        },
        fetchVideos() {
            window.api.send("toPopular");
            window.api.send("syncPreferences");
            

            if (this.query !== "") {
                this.searchVideo();
                return
            }
            window.api.receive("fromSearch", (data) => {
                this.allVideos = data
                this.currentResolutions = this.allVideos[this.videoIndex]['video_files'];
                this.showMenuF()
            });

            window.api.receive("fromShowMenu", (data) => {
                this.allVideos = data
                this.currentResolutions = this.allVideos[this.videoIndex]['video_files'];
                this.showMenu = false;
            });
            
            window.api.receive("fromPopular", (data) => {
                this.allVideos = data
                this.currentResolutions = this.allVideos[this.videoIndex]['video_files'];
            });
            window.api.receive("fromVisualSyncToAlpine", (data) => {
                console.log("---------------------------------------------")
                console.log(data);
                console.log("---------------------------------------------")
                this.visualization = data;
            });
            window.api.receive("fromPerPageSyncToAlpine", (data) => {
                this.perPage = data;
                if (this.perPage < this.videoIndex) this.videoIndex = this.perPage - 1;

                console.log("fetching "+this.perPage+" videos")
                this.onlyGetVideos();
            });
        },
        openVideo(url){
            console.log("on openVideo")
            window.api.send("openWindow",url)
        },
        onlyGetVideos(){
            if (this.query !== "") {
                this.searchVideo();
                return
            }

            window.api.send("toPopular");
        },
        setVideo(videoIndex) {
            this.showVideoNumber = videoIndex
        },
        searchVideo() {

            this.loading = true;
            const query = this.query;
            window.api.send("toSearch", query);

        },
        previousVideo() {
            if (this.videoIndex > 0) {
                this.videoIndex--;
                this.currentResolutions = this.allVideos[this.videoIndex]['video_files'];
                this.showVideoNumber = -1;
            }
        },
        nextVideo() {

            if (this.videoIndex < this.allVideos.length - 1) {
                this.videoIndex++;
                this.currentResolutions = this.allVideos[this.videoIndex]['video_files'];
                this.showVideoNumber = -1;
            }
        }
    }
}

