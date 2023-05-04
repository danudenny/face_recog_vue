<template>
	<div>
		<div class="row">
			<div class="col-md-12">
				<video ref="video" id="videoElement" autoplay></video>
				<div>
					<h3 class="text-success" v-if="result === 'real'">Real</h3>
					<h3 class="text-danger" v-if="result === 'spoof'">Spoof</h3>
					<h3
						class="text-warning"
						v-if="result === 'no_face_detected'">
						No Face Detected
					</h3>
				</div>
				<div class="d-flex justify-content-start">
					<button class="btn btn-primary mr-2" @click="startVideo">
						Start Video
					</button>
					<button class="btn btn-danger" @click="stopVideo">
						Stop Video
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			result: null,
			isStartVideo: false,
			videoStream: null,
			videoInterval: null,
			apiProcessUrl: "https://apiface.danudenny.tech/process_video",
			apiStopUrl: "https://apiface.danudenny.tech/stop_stream",
		};
	},
	methods: {
		startVideo() {
			// this.isStartVideo = true;
			navigator.mediaDevices
				.getUserMedia({ video: true, audio: false })
				.then((stream) => {
					this.$refs.video.srcObject = stream;
					this.videoStream = stream;
					this.videoInterval = setInterval(async () => {
						await this.captureVideoFrame();
					}, 3000); // change the interval as per your requirement
				})
				.catch((error) => {
					console.log(error);
				});
		},
		stopVideo() {
			this.$refs.video.pause();
			clearInterval(this.videoInterval);
			fetch(this.apiStopUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ stop: true }),
			})
				.then((response) => {
					this.videoStream.getTracks().forEach((track) => {
						track.stop();
					});
				})
				.catch((error) => {
					console.log(error);
				});
		},
		async captureVideoFrame() {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			canvas.width = this.$refs.video.videoWidth;
			canvas.height = this.$refs.video.videoHeight;
			ctx.drawImage(this.$refs.video, 0, 0);
			const base64ImageData = canvas.toDataURL("image/jpeg");
			const bytes = Uint8Array.from(
				atob(base64ImageData.split(",")[1]),
				(c) => c.charCodeAt(0)
			);
			await fetch(this.apiProcessUrl, {
				method: "POST",
				body: bytes,
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((data) => {
					this.result = data.label;
					if (data.label == "real") {
						this.stopVideo();
					}
				})
				.catch((error) => {
					console.log(error);
				});
		},
	},
};
</script>

<style>
#videoElement {
	transform: rotateY(180deg);
	-webkit-transform: rotateY(180deg); /* Safari and Chrome */
	-moz-transform: rotateY(180deg); /* Firefox */
}
</style>
