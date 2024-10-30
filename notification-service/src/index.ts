import emailWorker from './workers/email.worker';

console.log('Starting email worker...');
emailWorker.run().catch(err => {
    console.error('Worker failed to start:', err);
});
