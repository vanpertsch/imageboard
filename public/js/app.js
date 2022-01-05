import * as Vue from './vue.js';
import modal from './modal.js';

Vue.createApp({
    data() {
        return {
            images: null,
            title: '',
            description: '',
            username: '',
            tags: "",
            tag: "",
            selectedImageId: location.pathname.slice(1),
            showMore: true,
            showMoreByTag: false,
            file: null,
            error: false
        };
    },
    components: {
        'modal': modal
    },
    methods: {
        selecteImage(imageId) {
            this.selectedImageId = imageId;
            history.pushState({}, "", `/${this.selectedImageId}`);
        },
        setFile(e) {
            this.file = e.target.files[0];
        },
        upload() {
            const formData = new FormData();
            formData.append('file', this.file);
            formData.append('title', this.title);
            formData.append('username', this.username);
            formData.append('description', this.description);
            formData.append('tags', this.tags);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
                .then((data) => data.json())
                .then((data) => {
                    this.images.unshift(data);
                });
            this.resetForm();

        },
        showmore() {
            const lowestIdOnScreen = Math.min.apply(null, this.images.map(item => item.id));

            fetch(`/moreimages/${lowestIdOnScreen}`)
                .then((data) => data.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        this.images.push(data[i]);
                        if (data[i].id === data[i].lowestId) {
                            this.showMore = false;
                        }
                    }
                });
        },
        showmorebytag() {
            const lowestIdOnScreen = Math.min.apply(null, this.images.map(item => item.id));

            fetch(`/moreimagesbytag/${lowestIdOnScreen}&${this.tag}`)
                .then((data) => data.json())
                .then((data) => {
                    if (data == "") {
                        this.showMoreByTag = false;
                    }
                    for (let i = 0; i < data.length; i++) {
                        this.images.push(data[i]);
                        if (data[i].id === Math.min.apply(null, this.images.map(item => item.id))) {
                            this.showMoreByTag = false;
                        }
                    }
                });
        },

        resetForm() {
            this.description = "";
            this.title = "";
            this.username = "";
            this.tags = "";
            this.file = "";
            this.$refs.fileupload.value = null;
        },
        handleRemove(a) {
            this.selectedImageId = "";
            history.pushState({}, "", `/`);
            if (a == "error") {
                this.error = true;
                history.replaceState({}, "", "/");
            }
        },
        handleSort(a) {
            this.tag = `${a}`;
            this.selectedImageId = "";
            history.pushState({}, "", `/${a}`);
            fetch(`/alltags/${a}`)
                .then((data) => data.json())
                .then((data) => {
                    this.images = data;
                });

            this.showMore = false;
            this.showMoreByTag = true;

        },
        handleDelete(id) {
            fetch(`/delete/${id}`)
                .then((data) => data.json())
                .then((data) => {
                    let deletedImage = this.images.filter((item) => item.id == data.id);
                    this.images.splice(deletedImage, 1);
                });
            this.handleRemove();
            history.pushState({}, "", `/`);
        },
        allBirds() {
            this.tag = "";
            this.showMoreByTag = false;
            this.showMore = true;
            history.pushState({}, "", `/`);
            fetch("/images.json")
                .then((data) => data.json())
                .then((data) => {
                    this.images = data;
                });

        }
    },
    mounted: function () {
        fetch("/images.json")
            .then((data) => data.json())
            .then((data) => {
                this.images = data;
                this.error = "";
            });


        window.addEventListener('popstate', (e) => {
            this.selectedImageId = location.pathname.slice(1);
            this.error = "";
        });
    },
    updated: function () {

    }
}).mount("#main");
