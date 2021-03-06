export default {
    data() {
        return {
            comments: null,
            username: "",
            comment: "",
            date: ""
        };
    },
    props: ['id'],
    mounted() {
        fetch(`/comments/${this.id}`)
            .then((data) => data.json())
            .then((data) => {
                this.comments = data;

            }).catch(error => console.log(error));

    },

    methods: {

        postcomment() {
            fetch('/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        comment: this.comment,
                        username: this.username,
                        image_id: this.id
                    }
                )
            })
                .then((data) => data.json())
                .then((data) => {
                    this.comments.unshift(data);
                });
            this.resetForm();
        },
        resetForm() {
            this.comment = "";
            this.username = "";

        },
    }, template: `
    <div class="comments-section">

        <div class="form-comments">
            <div class="input">
                <label for="comment">Add a comment</label>
                <input type="text" v-model="comment" name="comment">
            </div>
            <div class="input">
                <label for="username">Username </label>
                <input type="text" v-model="username" name="username">
            </div>
            <button @click="postcomment">Post Comment</button>
        </div>
          <div class="comments">

            <div class="comment" v-if="comments" v-for="comment in comments">
            <p>{{comment.comment}}</p>
            <span class="user-info">{{comment.username}}</span>
            </div>
        </div>
    </div>

    `,
};
