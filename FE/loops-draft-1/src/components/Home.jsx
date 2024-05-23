import {useNavigate} from 'react-router-dom'

export default function Home(){
    const navigate = useNavigate();
    return (
        <div className='homeMessage'>
            <h1>
            For anyone new...
            </h1>
            <iframe className='demoVid'width="700" height="397"
            src="https://www.youtube.com/embed/Sc1z7Y4p7Co">
            </iframe>
            <div className='pic1container'>
            <p>
            Loops is a collaborative songwriting tool, but it can also be used on your own. 
            A loop is a small chord progression consiting of 1-4 functional chord symbols 
            (chord symbols written in roman numerals, i.e. I, and relative to the key center of 
            no particular key), as well as a key signature, and a pairing set of absolute chord 
            symbols (chord symbols written with letters, i.e. Cmaj, which correspond to how we 
            label frequencies in our western music system). The program knows how to translate the 
            roman numeral symbols into the lettered symbols, and vice versa, given whatever key
            signature the loop is.
            </p>
            <img src="https://i.ibb.co/P6K1nd2/loops-ss-1.jpg" alt="loops-ss-1" border="0"></img>
            </div>
            <p>
            When you create a new loop, it can either be public, private, or a loopBank loop. 
            Public loops and private loops are both loop trees. In other words, they can be 
            replied to by people, and those replies might have replies, and so on. A public 
            loop is a loop that can be replied to be anyone. A private loop is a loop that 
            can only be replied to by yourself. A private loop is not publicly available for others 
            to even look at. A loopBank loop is a type of private loop. It is a private loop, 
            in the sense that nobody can see it but you, but also you cannot reply to it. 
            It is not a loop tree. You create loopBank loops to save them for later, so you can
            use them whenever you want, either within your own private loop trees or others' 
            public loop trees.
            </p>
            <p>
            Start loops have titles but replies do not. A reply loops' status is whatever the 
            status of the start loop is.
            </p>
            <p>
            When you change the identity of the roman numeral chord symbols, it's 
            sibling lettered chord symbols will also change corresponding to the key signature. 
            Also vice versa. This is supposed to happen. When you change the key, you have the 
            option to either keep the current roman numeral chord symbols, or keep the lettered 
            symbols instead.
            </p>
            <img src="https://i.ibb.co/rmk4J1K/loops-ss-2.jpg" alt="loops-ss-2" border="0"></img>
            <p>
            You can edit and delete a loop you created after you submit it, but only before others 
            reply to it. Once someone besides yourself replies to the loop, you can no longer edit 
            or delete the loop. 
            </p>
            <p>
            Any type of loop is also copyable, making it very easy to duplicate your loop or 
            someone else's loop, and make it your own. Loop trees (public or private) can also be
            forked. This is similar to copying the loop, but not only do you get a copy of the 
            loop, you also copy all of its replies, and their replies, and so on. You can then edit
            this forked loop tree, because the entire tree is now technically authored by you.
            </p>
            <img className='loopBankGreenButtonSS'src="https://i.ibb.co/RBfJ8M1/loops-ss-5.jpg" alt="loops-ss-5" border="0"></img>
            <p>
            When you reply to or edit a loop, you will notice an option to search from your loop 
            bank to choose one of your loopBank loops, or move straight into the loop editor. 
            Either way, you will have a chance to edit the loop in the editor before it is submitted.
            </p>
            <p>
            You can also save loops. This is different from copying a loop. This is just a way to 
            refer back to a loop, similar to saving somebody else's social media post. You cannot edit
            loops that you have only saved.
            </p>
            <p>
            If you click on a start loop's title, you will be directed to a loop tree page, 
            where you can open up all the replies of the start loop, as well as their replies,
            and so on.
            </p>
            <img className='loopTreeSS'src="https://i.ibb.co/jbmTzyV/loops-ss-4.jpg" alt="loops-ss-4" border="0"></img>
            <p>
            If you click on the "see thruline" button, you no longer see a tree, but one linear 
            "root" of the tree, all the way to the end of the branch, so to speak. You will see every 
            parent loop of the reply loop leading all the way back up to the start loop with the title. 
            You could think of this as one song, one of potentially hundreds or even thousands of songs 
            created from one single loop tree.
            </p>
            <p>
            If you own a private loop tree, you can allow others to access the loop tree by clicking on the 
            "Allow Access" button. Only you and the people you give access to can view and reply to the loops
            in the loop tree. This is perfect for if you have a secret project that you only want a few other
            users to know about.
            </p>
            <div className='getStarted'>
            <p>To get started:</p>
            <div className='homeLogInSignUp'>
            <button className='homeLogIn'type='button' onClick={()=> navigate('/login')}>Log In</button>
            <p>or</p>
            <button className='homeSignUp'type='button' onClick={()=> navigate('/register')}>Sign Up</button>
            </div>
            </div>
        </div>
    )
}