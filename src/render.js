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
        perPage: 10,
        perPageAvailable: [10, 25, 50, 100],
        currentResolutions: [],
        currentVideoFile: 0,
        showPreferences() {
            console.log(this.visualization)
            window.api.send("toShowPrefs");
        },
        showMenuF() {
            const perPage = this.perPage;
            this.showMenu = true;
            let self = this;
            if (this.menuInterval != null) clearInterval(this.menuInterval);
            this.menuInterval = setInterval(function () {
                if (self.query === "" && self.showMenu) {
                    window.api.send("toShowMenu", perPage);
                }
            }, 5000);
        },
        fetchVideos() {
            const perPage = this.perPage;
            window.api.send("toPopular", perPage);
            window.api.send("syncPreferences");
            if (this.perPage < this.videoIndex) this.videoIndex = this.perPage - 1;

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
            window.api.receive("fromSyncToAlpine", (data) => {

                this.visualization = data;
            });
        },
        setVideo(videoIndex) {
            this.showVideoNumber = videoIndex
        },
        searchVideo() {

            this.loading = true;
            const query = this.query;
            const perPage = this.perPage;
            window.api.send("toSearch", perPage, query);



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

