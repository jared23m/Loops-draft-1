
export default function LoopCard(props){

    return (
        <>
        {props.loop.title && <p>{props.loop.title}</p>}
        <p>@ {props.loop.timestamp}</p>
        <p>Created by: {props.loop.user.username}</p>
        {props.loop.parentloopid && <p>Reply to: {props.loop.parentloopid}</p>}
        {props.loop.originalloopid && <p>Forked from: {props.loop.originalloopid}</p>}
        {props.loop.status != 'reply' && <p>Status: {props.loop.status}</p>}
        <p>Key Signature: {props.loop.keysig}</p>
        <p>Chords:</p>
        {props.loop.relativeChords.map((chord) => {
            return <div key={chord.id}>
                <p>{chord.name}</p>
            </div>
        })}
        </>
    )
}