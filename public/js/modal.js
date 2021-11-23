
import comments from './comments.js';

export default {

    data() {
        return {
            imageUrl: null,
            title: '',
            description: '',
            username: '',
            created: '',
            tags: null,
        };
    },
    components: {
        'comments': comments
    },
    props: ['id'],
    mounted() {
        // a mounted function that fetches the image info for the image whose id was passed as a prop.Upon receiving the info, the data properties should be set
        fetch(`/images/${this.id}`)
            .then((data) => {
                return data.json();
            })
            .then((data) => {
                if (data.error) {
                    this.close("error");
                } else {
                    const { url, title, description, username, created_at } = data;
                    this.imageUrl = url;
                    this.title = title;
                    this.description = description;
                    this.username = username;
                    this.created = new Date(created_at).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });
                }


            });

        fetch(`/tags/${this.id}`)
            .then((data) => data.json())
            .then((data) => {
                console.log("tags from server:", data);
                this.tags = data;
            });

    },
    template: `
        <div id="overlay" class="overlay">
        </div>

            <div class="box__image-modal">
                <div @click="close" class="close">X
                </div>

                <img class="image-modal" :src="imageUrl" :alt="title">

                 <div class="tags"><span class="tag">TAGS:</span>
                <span class="tag-underline" v-if="tags" v-for="tag in tags" @click="showImagesByTag(tag.tag)">{{tag.tag}}</span>
            </div>

                <div class="text-modal">
                    <h3 class="title-modal">{{title.toUpperCase()}}</h3>
                    <p class="decription-modal">{{description}}</p>
  <div><span class="user-info">User: {{username}}</span> <span class="user-info">🐦</span><span class="user-info">Posted at {{created}}</span></div>
                </div>
                <comments :id="id"></comments>

        </div>
    `,
    methods: {
        //close modal
        close(a) {
            this.$emit('remove', a);
        },
        showImagesByTag(a) {
            this.$emit('sort', a);
        }

    }
}
