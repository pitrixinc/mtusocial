import { BsImage, BsEmojiSmile } from "react-icons/bs"
import { AiOutlineVideoCameraAdd, AiOutlineClose } from "react-icons/ai"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addDoc, collection, doc, serverTimestamp, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { toast } from 'react-toastify';
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import Filter from 'bad-words'; // Import the bad-words library

const Input = () => {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentionInput, setMentionInput] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [mentionStartIndex, setMentionStartIndex] = useState(null);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tempHashtags, setTempHashtags] = useState([]); // Temporary storage for hashtags
  const filter = new Filter(); // Create a filter instance with default list of bad words

  // Add your custom list of bad words
  filter.addWords('fool', 'foolish', 'nigga','2 girls 1 cup', '2g1c', '4r5e', '5h1t', '5hit', 'a_s_s', 'a55', 'acrotomophilia', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anilingus', 'anus', 'apeshit', 'ar5e', 'arrse', 'arse', 'arsehole', 'ass', 'ass-fucker', 'ass-hat', 'ass-jabber', 'ass-pirate', 'assbag', 'assbandit', 'assbanger', 'assbite', 'assclown', 'asscock', 'asscracker', 'asses', 'assface', 'assfuck', 'assfucker', 'assfukka', 'assgoblin', 'asshat', 'asshead', 'asshole', 'assholes', 'asshopper', 'assjacker', 'asslick', 'asslicker', 'assmonkey', 'assmunch', 'assmuncher', 'assnigger', 'asspirate', 'assshit', 'assshole', 'asssucker', 'asswad', 'asswhole', 'asswipe', 'auto erotic', 'autoerotic', 'axwound', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'babeland', 'baby batter', 'baby juice', 'ball gag', 'ball gravy', 'ball kicking', 'ball licking', 'ball sack', 'ball sucking', 'ballbag', 'balls', 'ballsack', 'bampot', 'bangbros', 'bareback', 'barely legal', 'barenaked', 'bastard', 'bastardo', 'bastinado', 'bbw', 'bdsm', 'beaner', 'beaners', 'beastial', 'beastiality', 'beaver cleaver', 'beaver lips', 'bellend', 'bestial', 'bestiality', 'bi+ch', 'biatch', 'big black', 'big breasts', 'big knockers', 'big tits', 'bimbos', 'birdlock', 'bitch', 'bitchass', 'bitcher', 'bitchers', 'bitches', 'bitchin', 'bitching', 'bitchtits', 'bitchy', 'black cock', 'blonde action', 'blonde on blonde action', 'bloody', 'blow job', 'blow your load', 'blowjob', 'blowjobs', 'blue waffle', 'blumpkin', 'boiolas', 'bollock', 'bollocks', 'bollok', 'bollox', 'bondage', 'boner', 'boob', 'boobs', 'booobs', 'boooobs', 'booooobs', 'booooooobs', 'booty call', 'breasts', 'breeder', 'brotherfucker', 'brown showers', 'brunette action', 'buceta', 'bugger', 'bukkake', 'bulldyke', 'bullet vibe', 'bullshit', 'bum', 'bumblefuck', 'bung hole', 'bunghole', 'bunny fucker', 'busty', 'butt', 'butt plug', 'butt-pirate', 'buttcheeks', 'buttfucka', 'buttfucker', 'butthole', 'buttmuch', 'buttplug', 'c0ck', 'c0cksucker', 'camel toe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'cawk', 'chesticle', 'chinc', 'chink', 'choad', 'chocolate rosebuds', 'chode', 'cipa', 'circlejerk', 'cl1t', 'cleveland steamer', 'clit', 'clitface', 'clitfuck', 'clitoris', 'clits', 'clover clamps', 'clusterfuck', 'cnut', 'cock', 'cock-sucker', 'cockass', 'cockbite', 'cockburger', 'cockeye', 'cockface', 'cockfucker', 'cockhead', 'cockjockey', 'cockknoker', 'cocklump', 'cockmaster', 'cockmongler', 'cockmongruel', 'cockmonkey', 'cockmunch', 'cockmuncher', 'cocknose', 'cocknugget', 'cocks', 'cockshit', 'cocksmith', 'cocksmoke', 'cocksmoker', 'cocksniffer', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cockwaffle', 'cok', 'cokmuncher', 'coksucka', 'coochie', 'coochy', 'coon', 'coons', 'cooter', 'coprolagnia', 'coprophilia', 'cornhole', 'cox', 'cracker', 'crap', 'creampie', 'crotte', 'cum', 'cumbubble', 'cumdumpster', 'cumguzzler', 'cumjockey', 'cummer', 'cumming', 'cums', 'cumshot', 'cumslut', 'cumtart', 'cunilingus', 'cunillingus', 'cunnie', 'cunnilingus', 'cunt', 'cuntass', 'cuntface', 'cunthole', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cuntrag', 'cunts', 'cuntslut', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'dago', 'damn', 'darkie', 'date rape', 'daterape', 'deep throat', 'deepthroat', 'deggo', 'dendrophilia', 'dick', 'dick-sneeze', 'dickbag', 'dickbeaters', 'dickface', 'dickfuck', 'dickfucker', 'dickhead', 'dickhole', 'dickjuice', 'dickmilk', 'dickmonger', 'dicks', 'dickslap', 'dicksucker', 'dicksucking', 'dicktickler', 'dickwad', 'dickweasel', 'dickweed', 'dickwod', 'dike', 'dildo', 'dildos', 'dingleberries', 'dingleberry', 'dink', 'dinks', 'dipshit', 'dirsa', 'dirty pillows', 'dirty sanchez', 'dlck', 'dog style', 'dog-fucker', 'doggie style', 'doggiestyle', 'doggin', 'dogging', 'doggy style', 'doggystyle', 'dolcett', 'domination', 'dominatrix', 'dommes', 'donkey punch', 'donkeyribber', 'doochbag', 'dookie', 'doosh', 'double dong', 'double penetration', 'doublelift', 'douche', 'douche-fag', 'douchebag', 'douchewaffle', 'dp action', 'dry hump', 'duche', 'dumass', 'dumb ass', 'dumbass', 'dumbcunt', 'dumbfuck', 'dumbshit', 'dumshit', 'dvda', 'dyke', 'eat my ass', 'ecchi', 'ejaculate', 'ejaculated', 'ejaculates', 'ejaculating', 'ejaculatings', 'ejaculation', 'ejakulate', 'erotic', 'erotism', 'escort', 'eunuch', 'f u c k', 'f u c k e r', 'f_u_c_k', 'f4nny', 'fag', 'fagbag', 'fagfucker', 'fagging', 'faggit', 'faggitt', 'faggot', 'faggotcock', 'faggs', 'fagot', 'fagots', 'fags', 'fagtard', 'fanny', 'fannyflaps', 'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking', 'fecal', 'feck', 'fecker', 'felch', 'felching', 'fellate', 'fellatio', 'feltch', 'female squirting', 'femdom', 'figging', 'fingerbang', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fingering', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'fisting', 'flamer', 'flange', 'foah', 'fook', 'fooker', 'foot fetish', 'footjob', 'frotting', 'fuck', 'fuck buttons', 'fuck off', 'fucka', 'fuckass', 'fuckbag', 'fuckboy', 'fuckbrain', 'fuckbutt', 'fuckbutter', 'fucked', 'fucker', 'fuckers', 'fuckersucker', 'fuckface', 'fuckhead', 'fuckheads', 'fuckhole', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fucknut', 'fucknutt', 'fuckoff', 'fucks', 'fuckstick', 'fucktard', 'fucktards', 'fucktart', 'fucktwat', 'fuckup', 'fuckwad', 'fuckwhit', 'fuckwit', 'fuckwitt', 'fudge packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'futanari', 'fux', 'fux0r', 'g-spot', 'gang bang', 'gangbang', 'gangbanged', 'gangbangs', 'gay', 'gay sex', 'gayass', 'gaybob', 'gaydo', 'gayfuck', 'gayfuckist', 'gaylord', 'gaysex', 'gaytard', 'gaywad', 'genitals', 'giant cock', 'girl on', 'girl on top', 'girls gone wild', 'goatcx', 'goatse', 'god damn', 'god-dam', 'god-damned', 'goddamn', 'goddamned', 'goddamnit', 'gokkun', 'golden shower', 'goo girl', 'gooch', 'goodpoop', 'gook', 'goregasm', 'gringo', 'grope', 'group sex', 'guido', 'guro', 'hand job', 'handjob', 'hard core', 'hard on', 'hardcore', 'hardcoresex', 'heeb', 'hell', 'hentai', 'heshe', 'ho', 'hoar', 'hoare', 'hoe', 'hoer', 'homo', 'homodumbshit', 'homoerotic', 'honkey', 'hooker', 'hore', 'horniest', 'horny', 'hot carl', 'hot chick', 'hotsex', 'how to kill', 'how to murder', 'huge fat', 'humping', 'incest', 'intercourse', 'jack Off', 'jack-off', 'jackass', 'jackoff', 'jaggi', 'jagoff', 'jail bait', 'jailbait', 'jap', 'jelly donut', 'jerk off', 'jerk-off', 'jerkass', 'jigaboo', 'jiggaboo', 'jiggerboo', 'jism', 'jiz', 'jizm', 'jizz', 'juggs', 'jungle bunny', 'junglebunny', 'kawk', 'kike', 'kinbaku', 'kinkster', 'kinky', 'knob', 'knobbing', 'knobead', 'knobed', 'knobend', 'knobhead', 'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kooch', 'kootch', 'kraut', 'kum', 'kummer', 'kumming', 'kums', 'kunilingus', 'kunja', 'kunt', 'kyke', 'l3i+ch', 'l3itch', 'labia', 'lameass', 'lardass', 'leather restraint', 'leather straight jacket', 'lemon party', 'lesbian', 'lesbo', 'lezzie', 'lmfao', 'lolita', 'lovemaking', 'lust', 'lusting', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8', 'ma5terbate', 'make me come', 'male squirting', 'masochist', 'master-bate', 'masterb8', 'masterbat', 'masterbat3', 'masterbate', 'masterbation', 'masterbations', 'masturbate', 'mcfagget', 'menage a trois', 'mick', 'milf', 'minge', 'missionary position', 'mo-fo', 'mof0', 'mofo', 'mothafuck', 'mothafucka', 'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings', 'mothafucks', 'mother fucker', 'motherfuck', 'motherfucked', 'motherfucker', 'motherfuckers', 'motherfuckin', 'motherfucking', 'motherfuckings', 'motherfuckka', 'motherfucks', 'mound of venus', 'mr hands', 'muff', 'muff diver', 'muffdiver', 'muffdiving', 'munging', 'mutha', 'muthafecker', 'muthafuckker', 'muther', 'mutherfucker', 'n1gga', 'n1gger', 'nambla', 'nawashi', 'nazi', 'negro', 'neonazi', 'nig nog', 'nigaboo', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger', 'niggers', 'niglet', 'nimphomania', 'nipple', 'nipples', 'nob', 'nob jokey', 'nobhead', 'nobjocky', 'nobjokey', 'nsfw images', 'nude', 'nudity', 'numbnuts', 'nut sack', 'nutsack', 'nympho', 'nymphomania', 'octopussy', 'omorashi', 'one cup two girls', 'one guy one jar', 'orgasim', 'orgasims', 'orgasm', 'orgasms', 'orgy', 'p0rn', 'paedophile', 'paki', 'panooch', 'panties', 'panty', 'pawn', 'pecker', 'peckerhead', 'pedobear', 'pedophile', 'pegging', 'penis', 'penisbanger', 'penisfucker', 'penispuffer', 'phone sex', 'phonesex', 'phuck', 'phuk', 'phuked', 'phuking', 'phukked', 'phukking', 'phuks', 'phuq', 'piece of shit', 'pigfucker', 'pimpis', 'piss', 'piss pig', 'pissed', 'pissed off', 'pisser', 'pissers', 'pisses', 'pissflaps', 'pissin', 'pissing', 'pissoff', 'pisspig', 'playboy', 'pleasure chest', 'pole smoker', 'polesmoker', 'pollock', 'ponyplay', 'poof', 'poon', 'poonani', 'poonany', 'poontang', 'poop', 'poop chute', 'poopchute', 'poopuncher', 'porch monkey', 'porchmonkey', 'porn', 'porno', 'pornography', 'pornos', 'prick', 'pricks', 'prince albert piercing', 'pron', 'pthc', 'pube', 'pubes', 'punanny', 'punany', 'punta', 'pusse', 'pussi', 'pussies', 'pussy', 'pussylicking', 'pussys', 'pust', 'puto', 'queaf', 'queef', 'queer', 'queerbait', 'queerhole', 'quim', 'raghead', 'raging boner', 'rape', 'raping', 'rapist', 'rectum', 'renob', 'retard', 'reverse cowgirl', 'rimjaw', 'rimjob', 'rimming', 'rosy palm', 'rosy palm and her 5 sisters', 'ruski', 'rusty trombone', 's.o.b.', 's&m', 'sadism', 'sadist', 'sand nigger', 'sandler', 'sandnigger', 'sanger', 'santorum', 'scat', 'schlong', 'scissoring', 'screwing', 'scroat', 'scrote', 'scrotum', 'seks', 'semen', 'sex', 'sexo', 'sexy', 'shag', 'shagger', 'shaggin', 'shagging', 'shaved beaver', 'shaved pussy', 'shemale', 'shi+', 'shibari', 'shit', 'shitass', 'shitbag', 'shitbagger', 'shitblimp', 'shitbrains', 'shitbreath', 'shitcanned', 'shitcunt', 'shitdick', 'shite', 'shited', 'shitey', 'shitface', 'shitfaced', 'shitfuck', 'shitfull', 'shithead', 'shithole', 'shithouse', 'shiting', 'shitings', 'shits', 'shitspitter', 'shitstain', 'shitted', 'shitter', 'shitters', 'shittiest', 'shitting', 'shittings', 'shitty', 'shiz', 'shiznit', 'shota', 'shrimping', 'skank', 'skeet', 'skullfuck', 'slag', 'slanteye', 'slut', 'slutbag', 'sluts', 'smeg', 'smegma', 'smut', 'snatch', 'snowballing', 'sodomize', 'sodomy', 'son-of-a-bitch', 'spac', 'spic', 'spick', 'splooge', 'splooge moose', 'spooge', 'spook', 'spread legs', 'spunk', 'strap on', 'strapon', 'strappado', 'strip club', 'style doggy', 'suck', 'suckass', 'sucks', 'suicide girls', 'sultry women', 'swastika', 'swinger', 't1tt1e5', 't1tties', 'tainted love', 'tard', 'taste my', 'tea bagging', 'teets', 'teez', 'testical', 'testicle', 'threesome', 'throating', 'thundercunt', 'tied up', 'tight white', 'tit', 'titfuck', 'tits', 'titt', 'tittie5', 'tittiefucker', 'titties', 'titty', 'tittyfuck', 'tittywank', 'titwank', 'tongue in a', 'topless', 'tosser', 'towelhead', 'tranny', 'tribadism', 'tub girl', 'tubgirl', 'turd', 'tushy', 'tw4t', 'twat', 'twathead', 'twatlips', 'twats', 'twatty', 'twatwaffle', 'twink', 'twinkie', 'two girls one cup', 'twunt', 'twunter', 'unclefucker', 'undressing', 'upskirt', 'urethra play', 'urophilia', 'v14gra', 'v1gra', 'va-j-j', 'vag', 'vagina', 'vajayjay', 'venus mound', 'viagra', 'vibrator', 'violet wand', 'vjayjay', 'vorarephilia', 'voyeur', 'vulva', 'w00se', 'wang', 'wank', 'wanker', 'wankjob', 'wanky', 'wet dream', 'wetback', 'white power', 'whoar', 'whore', 'whorebag', 'whoreface', 'willies', 'willy', 'wop', 'wrapping men', 'wrinkled starfish', 'xrated', 'xx', 'xxx', 'yaoi', 'yellow showers', 'yiffy', 'zoophilia', 'zubb', 'a$$', 'a$$hole', 'a55hole', 'ahole', 'anal impaler', 'anal leakage', 'analprobe', 'ass fuck', 'ass hole', 'assbang', 'assbanged', 'assbangs', 'assfaces', 'assh0le', 'beatch', 'bimbo', 'bitch tit', 'bitched', 'bloody hell', 'bootee', 'bootie', 'bull shit', 'bullshits', 'bullshitted', 'bullturds', 'bum boy', 'butt fuck', 'buttfuck', 'buttmunch', 'c-0-c-k', 'c-o-c-k', 'c-u-n-t', 'c.0.c.k', 'c.o.c.k.', 'c.u.n.t', 'caca', 'cacafuego', 'chi-chi man', 'child-fucker', 'clit licker', 'cock sucker', 'corksucker', 'corp whore', 'crackwhore', 'dammit', 'damned', 'damnit', 'darn', 'dick head', 'dick hole', 'dick shy', 'dick-ish', 'dickdipper', 'dickflipper', 'dickheads', 'dickish', 'f-u-c-k', 'f.u.c.k', 'fist fuck', 'fuck hole', 'fuck puppet', 'fuck trophy', 'fuck yo mama', 'fuck you', 'fuck-ass', 'fuck-bitch', 'fuck-tard', 'fuckedup', 'fuckmeat', 'fucknugget', 'fucktoy', 'fuq', 'gassy ass', 'h0m0', 'h0mo', 'ham flap', 'he-she', 'hircismus', 'holy shit', 'hom0', 'hoor', 'jackasses', 'jackhole', 'middle finger', 'moo foo', 'naked', 'p.u.s.s.y.', 'piss off', 'piss-off', 'rubbish', 's-o-b', 's0b', 'shit ass', 'shit fucker', 'shiteater', 'son of a bitch', 'son of a whore', 'two fingers', 'wh0re', 'wh0reface', 'arse', 'arsehole', 'as useful as tits on a bull', 'balls', 'bastard', 'beaver', 'beef curtains', 'bell', 'bellend', 'bent', 'berk', 'bint', 'bitch', 'blighter', 'blimey', 'blimey oreilly', 'bloodclaat', 'bloody', 'bloody hell', 'blooming', 'bollocks', 'bonk', 'bugger', 'bugger me', 'bugger off', 'built like a brick shit-house', 'bukkake', 'bullshit', 'cack', 'cad', 'chav', 'cheese eating surrender monkey', 'choad', 'chuffer', 'clunge', 'cobblers', 'cock', 'cock cheese', 'cock jockey', 'cock-up', 'cocksucker', 'cockwomble', 'codger', 'cor blimey', 'corey', 'cow', 'crap', 'crikey', 'cunt', 'daft', 'daft cow', 'damn', 'dick', 'dickhead', 'did he bollocks!', 'did i fuck as like!', 'dildo', 'dodgy', 'duffer', 'fanny', 'feck', 'flaps', 'fuck', 'fuck me sideways!', 'fucking cunt', 'fucktard', 'gash', 'ginger', 'git', 'gob shite', 'goddam', 'gorblimey', 'gordon bennett', 'gormless', 'he’s a knob', 'hell', '', 'hobknocker', 'Id rather snort my own cum', 'jesus christ', 'jizz', 'knob', 'knobber', 'knobend', 'knobhead', 'ligger', 'like fucking a dying man handshake', 'mad as a hatter', 'manky', 'minge', 'minger', 'minging', 'motherfucker', 'munter', 'muppet', 'naff', 'nitwit', 'nonce', 'numpty', 'nutter', 'off their rocker', 'penguin', 'pillock', 'pish', 'piss off', 'piss-flaps', 'pissed', 'pissed off', 'play the five-fingered flute', 'plonker', 'ponce', 'poof', 'pouf', 'poxy', 'prat', 'prick', 'prick', 'prickteaser', 'punani', 'punny', 'pussy', 'randy', 'rapey', 'rat arsed', 'rotter', 'rubbish', 'scrubber', 'shag', 'shit', 'shite', 'shitfaced', 'skank', 'slag', 'slapper', 'slut', 'snatch', 'sod', 'sod-off', 'son of a bitch', 'spunk', 'stick it up your arse!', 'swine', 'taking the piss', 'tart', 'tits', 'toff', 'tosser', 'trollop', 'tuss', 'twat', 'twonk', 'u fukin wanker', 'wally', 'wanker', 'wankstain', 'wazzack', 'whore', '2 girls 1 cup', '2g1c', '4r5e', '5h1t', '5hit', 'a_s_s', 'a$$', 'a$$hole', 'a2m', 'a54', 'a55', 'a55hole', 'aeolus', 'ahole', 'alabama hot pocket', 'alaskan pipeline', 'anal', 'anal impaler', 'anal leakage', 'analannie', 'analprobe', 'analsex', 'anilingus', 'anus', 'apeshit', 'ar5e', 'areola', 'areole', 'arian', 'arrse', 'arse', 'arsehole', 'aryan', 'ass', 'ass fuck', 'ass hole', 'ass-fucker', 'ass-hat', 'ass-jabber', 'ass-pirate', 'assault', 'assbag', 'assbagger', 'assbandit', 'assbang', 'assbanged', 'assbanger', 'assbangs', 'assbite', 'assblaster', 'assclown', 'asscock', 'asscracker', 'asses', 'assface', 'assfaces', 'assfuck', 'assfucker', 'assfukka', 'assgoblin', 'assh0le', 'asshat', 'asshead', 'assho1e', 'asshole', 'assholes', 'asshopper', 'asshore', 'assjacker', 'assjockey', 'asskiss', 'asskisser', 'assklown', 'asslick', 'asslicker', 'asslover', 'assman', 'assmaster', 'assmonkey', 'assmucus', 'assmunch', 'assmuncher', 'assnigger', 'asspacker', 'asspirate', 'asspuppies', 'assranger', 'assshit', 'assshole', 'asssucker', 'asswad', 'asswhore', 'asswipe', 'asswipes', 'auto erotic', 'autoerotic', 'axwound', 'azazel', 'azz', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'babe', 'babeland', 'babes', 'baby batter', 'baby juice', 'badfuck', 'ball gag', 'ball gravy', 'ball kicking', 'ball licking', 'ball sack', 'ball sucking', 'ballbag', 'balllicker', 'balls', 'ballsack', 'bampot', 'bang', 'bang (ones) box', 'bangbros', 'banger', 'banging', 'bareback', 'barely legal', 'barenaked', 'barf', 'barface', 'barfface', 'bastard', 'bastardo', 'bastards', 'bastinado', 'batty boy', 'bawdy', 'bazongas', 'bazooms', 'bbw', 'bdsm', 'beaner', 'beaners', 'beardedclam', 'beastial', 'beastiality', 'beatch', 'beater', 'beatyourmeat', 'beaver', 'beaver cleaver', 'beaver lips', 'beef curtain', 'beef curtains', 'beer', 'beeyotch', 'bellend', 'bender', 'beotch', 'bestial', 'bestiality', 'bi-sexual', 'bi+ch', 'biatch', 'bicurious', 'big black', 'big breasts', 'big knockers', 'big tits', 'bigbastard', 'bigbutt', 'bigger', 'bigtits', 'bimbo', 'bimbos', 'bint', 'birdlock', 'bisexual', 'bitch', 'bitch tit', 'bitchass', 'bitched', 'bitcher', 'bitchers', 'bitches', 'bitchez', 'bitchin', 'bitching', 'bitchtits', 'bitchy', 'black cock', 'blonde action', 'blonde on blonde action', 'bloodclaat', 'bloody', 'bloody hell', 'blow', 'blow job', 'blow me', 'blow mud', 'blow your load', 'blowjob', 'blowjobs', 'blue waffle', 'blumpkin', 'boang', 'bod', 'bodily', 'bogan', 'bohunk', 'boink', 'boiolas', 'bollick', 'bollock', 'bollocks', 'bollok', 'bollox', 'bomd', 'bondage', 'bone', 'boned', 'boner', 'boners', 'bong', 'boob', 'boobies', 'boobs', 'booby', 'booger', 'bookie', 'boong', 'boonga', 'booobs', 'boooobs', 'booooobs', 'booooooobs', 'bootee', 'bootie', 'booty', 'booty call', 'booze', 'boozer', 'boozy', 'bosom', 'bosomy', 'bowel', 'bowels', 'bra', 'brassiere', 'breast', 'breastjob', 'breastlover', 'breastman', 'breasts', 'breeder', 'brotherfucker', 'brown showers', 'brunette action', 'buceta', 'bugger', 'buggered', 'buggery', 'bukkake', 'bull shit', 'bullcrap', 'bulldike', 'bulldyke', 'bullet vibe', 'bullshit', 'bullshits', 'bullshitted', 'bullturds', 'bum', 'bum boy', 'bumblefuck', 'bumclat', 'bumfuck', 'bummer', 'bung', 'bung hole', 'bunga', 'bunghole', 'bunny fucker', 'bust a load', 'busty', 'butchdike', 'butchdyke', 'butt', 'butt fuck', 'butt plug', 'butt-bang', 'butt-fuck', 'butt-fucker', 'butt-pirate', 'buttbang', 'buttcheeks', 'buttface', 'buttfuck', 'buttfucka', 'buttfucker', 'butthead', 'butthole', 'buttman', 'buttmuch', 'buttmunch', 'buttmuncher', 'buttplug', 'c-0-c-k', 'c-o-c-k', 'c-u-n-t', 'c.0.c.k', 'c.o.c.k.', 'c.u.n.t', 'c0ck', 'c0cksucker', 'caca', 'cahone', 'camel toe', 'cameltoe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'cawk', 'cervix', 'chesticle', 'chi-chi man', 'chick with a dick', 'child-fucker', 'chin', 'chinc', 'chincs', 'chink', 'chinky', 'choad', 'choade', 'choc ice', 'chocolate rosebuds', 'chode', 'chodes', 'chota bags', 'cipa', 'circlejerk', 'cl1t', 'cleveland steamer', 'climax', 'clit', 'clit licker', 'clitface', 'clitfuck', 'clitoris', 'clitorus', 'clits', 'clitty', 'clitty litter', 'clogwog', 'clover clamps', 'clunge', 'clusterfuck', 'cnut', 'cocain', 'cocaine', 'cock', 'cock pocket', 'cock snot', 'cock sucker', 'cockass', 'cockbite', 'cockblock', 'cockburger', 'cockeye', 'cockface', 'cockfucker', 'cockhead', 'cockholster', 'cockjockey', 'cockknocker', 'cockknoker', 'cocklicker', 'cocklover', 'cocklump', 'cockmaster', 'cockmongler', 'cockmongruel', 'cockmonkey', 'cockmunch', 'cockmuncher', 'cocknose', 'cocknugget', 'cocks', 'cockshit', 'cocksmith', 'cocksmoke', 'cocksmoker', 'cocksniffer', 'cocksucer', 'cocksuck', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksuckers', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cockwaffle', 'coffin dodger', 'coital', 'cok', 'cokmuncher', 'coksucka', 'commie', 'condom', 'coochie', 'coochy', 'coon', 'coonnass', 'coons', 'cooter', 'cop some wood', 'coprolagnia', 'coprophilia', 'corksucker', 'cornhole', 'corp whore', 'cox', 'crabs', 'crack', 'crack-whore', 'cracker', 'crackwhore', 'crap', 'crappy', 'creampie', 'cretin', 'crikey', 'cripple', 'crotte', 'cum', 'cum chugger', 'cum dumpster', 'cum freak', 'cum guzzler', 'cumbubble', 'cumdump', 'cumdumpster', 'cumguzzler', 'cumjockey', 'cummer', 'cummin', 'cumming', 'cums', 'cumshot', 'cumshots', 'cumslut', 'cumstain', 'cumtart', 'cunilingus', 'cunillingus', 'cunn', 'cunnie', 'cunnilingus', 'cunntt', 'cunny', 'cunt', 'cunt hair', 'cunt-struck', 'cuntass', 'cuntbag', 'cuntface', 'cuntfuck', 'cuntfucker', 'cunthole', 'cunthunter', 'cuntlick', 'cuntlick', 'cuntlicker', 'cuntlicker', 'cuntlicking', 'cuntrag', 'cunts', 'cuntsicle', 'cuntslut', 'cuntsucker', 'cut rope', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'cybersex', 'd0ng', 'd0uch3', 'd0uche', 'd1ck', 'd1ld0', 'd1ldo', 'dago', 'dagos', 'dammit', 'damn', 'damned', 'damnit', 'darkie', 'darn', 'date rape', 'daterape', 'dawgie-style', 'deep throat', 'deepthroat', 'deggo', 'dendrophilia', 'dick', 'dick head', 'dick hole', 'dick shy', 'dick-ish', 'dick-sneeze', 'dickbag', 'dickbeaters', 'dickbrain', 'dickdipper', 'dickface', 'dickflipper', 'dickfuck', 'dickfucker', 'dickhead', 'dickheads', 'dickhole', 'dickish', 'dickjuice', 'dickmilk', 'dickmonger', 'dickripper', 'dicks', 'dicksipper', 'dickslap', 'dicksucker', 'dicksucking', 'dicktickler', 'dickwad', 'dickweasel', 'dickweed', 'dickwhipper', 'dickwod', 'dickzipper', 'diddle', 'dike', 'dildo', 'dildos', 'diligaf', 'dillweed', 'dimwit', 'dingle', 'dingleberries', 'dingleberry', 'dink', 'dinks', 'dipship', 'dipshit', 'dirsa', 'dirty', 'dirty pillows', 'dirty sanchez', 'dlck', 'dog style', 'dog-fucker', 'doggie style', 'doggie-style', 'doggiestyle', 'doggin', 'dogging', 'doggy style', 'doggy-style', 'doggystyle', 'dolcett', 'domination', 'dominatrix', 'dommes', 'dong', 'donkey punch', 'donkeypunch', 'donkeyribber', 'doochbag', 'doofus', 'dookie', 'doosh', 'dopey', 'double dong', 'double penetration', 'doublelift', 'douch3', 'douche', 'douche-fag', 'douchebag', 'douchebags', 'douchewaffle', 'douchey', 'dp action', 'drunk', 'dry hump', 'duche', 'dumass', 'dumb ass', 'dumbass', 'dumbasses', 'dumbcunt', 'dumbfuck', 'dumbshit', 'dummy', 'dumshit', 'dvda', 'dyke', 'dykes', 'eat a dick', 'eat hair pie', 'eat my ass', 'eatpussy', 'ecchi', 'ejaculate', 'ejaculated', 'ejaculates', 'ejaculating', 'ejaculatings', 'ejaculation', 'ejakulate', 'enlargement', 'erect', 'erection', 'erotic', 'erotism', 'escort', 'essohbee', 'eunuch', 'extacy', 'extasy', 'f u c k', 'f u c k e r', 'f_u_c_k', 'f-u-c-k', 'f.u.c.k', 'f4nny', 'facefucker', 'facial', 'fack', 'fag', 'fagbag', 'fagfucker', 'fagg', 'fagged', 'fagging', 'faggit', 'faggitt', 'faggot', 'faggotcock', 'faggots', 'faggs', 'fagot', 'fagots', 'fags', 'fagtard', 'faig', 'faigt', 'fanny', 'fannybandit', 'fannyflaps', 'fannyfucker', 'fanyy', 'fart', 'fartknocker', 'fastfuck', 'fat', 'fatass', 'fatfuck', 'fatfucker', 'fcuk', 'fcuker', 'fcuking', 'fecal', 'feck', 'fecker', 'felch', 'felcher', 'felching', 'fellate', 'fellatio', 'feltch', 'feltcher', 'female squirting', 'femdom', 'fenian', 'figging', 'fingerbang', 'fingerfuck', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fingering', 'fist fuck', 'fisted', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'fisting', 'fisty', 'flamer', 'flange', 'flaps', 'fleshflute', 'flog the log', 'floozy', 'foad', 'foah', 'fondle', 'foobar', 'fook', 'fooker', 'foot fetish', 'footfuck', 'footfucker', 'footjob', 'footlicker', 'foreskin', 'freakfuck', 'freakyfucker', 'freefuck', 'freex', 'frigg', 'frigga', 'frotting', 'fubar', 'fuc', 'fuck', 'fuck buttons', 'fuck hole', 'fuck off', 'fuck puppet', 'fuck trophy', 'fuck yo mama', 'fuck you', 'fuck-ass', 'fuck-bitch', 'fuck-tard', 'fucka', 'fuckass', 'fuckbag', 'fuckboy', 'fuckbrain', 'fuckbutt', 'fuckbutter', 'fucked', 'fuckedup', 'fucker', 'fuckers', 'fuckersucker', 'fuckface', 'fuckfreak', 'fuckhead', 'fuckheads', 'fuckher', 'fuckhole', 'fuckin', 'fucking', 'fuckingbitch', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fuckme', 'fuckmeat', 'fuckmehard', 'fuckmonkey', 'fucknugget', 'fucknut', 'fucknutt', 'fuckoff', 'fucks', 'fuckstick', 'fucktard', 'fucktards', 'fucktart', 'fucktoy', 'fucktwat', 'fuckup', 'fuckwad', 'fuckwhit', 'fuckwhore', 'fuckwit', 'fuckwitt', 'fuckyou', 'fudge packer', 'fudge-packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkers', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'fuq', 'futanari', 'fux', 'fux0r', 'fvck', 'fxck', 'g-spot', 'gae', 'gai', 'gang bang', 'gang-bang', 'gangbang', 'gangbanged', 'gangbangs', 'ganja', 'gash', 'gassy ass', 'gay sex', 'gayass', 'gaybob', 'gaydo', 'gayfuck', 'gayfuckist', 'gaylord', 'gays', 'gaysex', 'gaytard', 'gaywad', 'gender bender', 'genitals', 'gey', 'gfy', 'ghay', 'ghey', 'giant cock', 'gigolo', 'ginger', 'gippo', 'girl on', 'girl on top', 'girls gone wild', 'git', 'glans', 'goatcx', 'goatse', 'god damn', 'god-dam', 'god-damned', 'godamn', 'godamnit', 'goddam', 'goddammit', 'goddamn', 'goddamned', 'goddamnit', 'goddamnmuthafucker', 'godsdamn', 'gokkun', 'golden shower', 'goldenshower', 'golliwog', 'gonad', 'gonads', 'gonorrehea', 'goo girl', 'gooch', 'goodpoop', 'gook', 'gooks', 'goregasm', 'gotohell', 'gringo', 'grope', 'group sex', 'gspot', 'gtfo', 'guido', 'guro', 'h0m0', 'h0mo', 'ham flap', 'hand job', 'handjob', 'hard core', 'hard on', 'hardcore', 'hardcoresex', 'he-she', 'he11', 'headfuck', 'hebe', 'heeb', 'hell', 'hemp', 'hentai', 'heroin', 'herp', 'herpes', 'herpy', 'heshe', 'hitler', 'hiv', 'ho', 'hoar', 'hoare', 'hobag', 'hoe', 'hoer', 'holy shit', 'hom0', 'homey', 'homo', 'homodumbshit', 'homoerotic', 'homoey', 'honkey', 'honky', 'hooch', 'hookah', 'hooker', 'hoor', 'hootch', 'hooter', 'hooters', 'hore', 'horniest', 'horny', 'hot carl', 'hot chick', 'hotpussy', 'hotsex', 'how to kill', 'how to murdep', 'how to murder', 'huge fat', 'hump', 'humped', 'humping', 'hun', 'hussy', 'hymen', 'iap', 'iberian slap', 'inbred', 'incest', 'injun', 'intercourse', 'j3rk0ff', 'jack off', 'jack-off', 'jackass', 'jackasses', 'jackhole', 'jackoff', 'jaggi', 'jagoff', 'jail bait', 'jailbait', 'jap', 'japs', 'jelly donut', 'jerk', 'jerk off', 'jerk-off', 'jerk0ff', 'jerkass', 'jerked', 'jerkoff', 'jigaboo', 'jiggaboo', 'jiggerboo', 'jism', 'jiz', 'jizm', 'jizz', 'jizzed', 'jock', 'juggs', 'jungle bunny', 'junglebunny', 'junkie', 'junky', 'kafir', 'kawk', 'kike', 'kikes', 'kill', 'kinbaku', 'kinkster', 'kinky', 'kkk', 'klan', 'knob', 'knob end', 'knobbing', 'knobead', 'knobed', 'knobend', 'knobhead', 'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kooch', 'kooches', 'kootch', 'kraut', 'kum', 'kummer', 'kumming', 'kums', 'kunilingus', 'kunja', 'kunt', 'kwif', 'kyke', 'l3i+ch', 'l3itch', 'labia', 'lameass', 'lardass', 'leather restraint', 'leather straight jacket', 'lech', 'lemon party', 'leper', 'lesbian', 'lesbians', 'lesbo', 'lesbos', 'lez', 'lezbian', 'lezbians', 'lezbo', 'lezbos', 'lezza', 'lezzie', 'lezzies', 'lezzy', 'lmao', 'lmfao', 'loin', 'loins', 'lolita', 'looney', 'lovemaking', 'lube', 'lust', 'lusting', 'lusty', 'm-fucking', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8', 'ma5terbate', 'mafugly', 'make me come', 'male squirting', 'mams', 'masochist', 'massa', 'master-bate', 'masterb8', 'masterbat', 'masterbat3', 'masterbate', 'masterbating', 'masterbation', 'masterbations', 'masturbate', 'masturbating', 'masturbation', 'maxi', 'mcfagget', 'menage a trois', 'menses', 'menstruate', 'menstruation', 'meth', 'mick', 'middle finger', 'midget', 'milf', 'minge', 'minger', 'missionary position', 'mo-fo', 'mof0', 'mofo', 'molest', 'mong', 'moo moo foo foo', 'moolie', 'moron', 'mothafuck', 'mothafucka', 'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings', 'mothafucks', 'mother fucker', 'motherfuck', 'motherfucka', 'motherfucked', 'motherfucker', 'motherfuckers', 'motherfuckin', 'motherfucking', 'motherfuckings', 'motherfuckka', 'motherfucks', 'mound of venus', 'mr hands', 'mtherfucker', 'mthrfucker', 'mthrfucking', 'muff', 'muff diver', 'muff puff', 'muffdiver', 'muffdiving', 'munging', 'munter', 'murder', 'mutha', 'muthafecker', 'muthafuckaz', 'muthafuckker', 'muther', 'mutherfucker', 'mutherfucking', 'muthrfucking', 'n1gga', 'n1gger', 'nad', 'nads', 'naked', 'nambla', 'napalm', 'nappy', 'nawashi', 'nazi', 'nazism', 'need the dick', 'negro', 'neonazi', 'nig nog', 'nig-nog', 'nigaboo', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger', 'niggers', 'niggle', 'niglet', 'nimphomania', 'nimrod', 'ninny', 'nipple', 'nipples', 'nob', 'nob jokey', 'nobhead', 'nobjocky', 'nobjokey', 'nonce', 'nooky', 'nsfw images', 'nude', 'nudity', 'numbnuts', 'nut butter', 'nut sack', 'nutsack', 'nutter', 'nympho', 'nymphomania', 'octopussy', 'old bag', 'omg', 'omorashi', 'one cup two girls', 'one guy one jar', 'opiate', 'opium', 'oral', 'orally', 'organ', 'orgasim', 'orgasims', 'orgasm', 'orgasmic', 'orgasms', 'orgies', 'orgy', 'ovary', 'ovum', 'ovums', 'p.u.s.s.y.', 'p0rn', 'paddy', 'paedophile', 'paki', 'panooch', 'pansy', 'pantie', 'panties', 'panty', 'pastie', 'pasty', 'pawn', 'pcp', 'pecker', 'peckerhead', 'pedo', 'pedobear', 'pedophile', 'pedophilia', 'pedophiliac', 'pee', 'peepee', 'pegging', 'penetrate', 'penetration', 'penial', 'penile', 'penis', 'penisbanger', 'penisfucker', 'penispuffer', 'perversion', 'peyote', 'phalli', 'phallic', 'phone sex', 'phonesex', 'phuck', 'phuk', 'phuked', 'phuking', 'phukked', 'phukking', 'phuks', 'phuq', 'piece of shit', 'pigfucker', 'pikey', 'pillowbiter', 'pimp', 'pimpis', 'pinko', 'piss', 'piss off', 'piss pig', 'piss-off', 'pissed', 'pissed off', 'pisser', 'pissers', 'pisses', 'pissflaps', 'pissin', 'pissing', 'pissoff', 'pisspig', 'playboy', 'pleasure chest', 'pms', 'polack', 'pole smoker', 'polesmoker', 'pollock', 'ponyplay', 'poof', 'poon', 'poonani', 'poonany', 'poontang', 'poop', 'poop chute', 'poopchute', 'poopuncher', 'porch monkey', 'porchmonkey', 'porn', 'porno', 'pornography', 'pornos', 'pot', 'potty', 'prick', 'pricks', 'prickteaser', 'prig', 'prince albert piercing', 'prod', 'pron', 'prostitute', 'prude', 'psycho', 'pthc', 'pube', 'pubes', 'pubic', 'pubis', 'punani', 'punanny', 'punany', 'punkass', 'punky', 'punta', 'puss', 'pusse', 'pussi', 'pussies', 'pussy', 'pussy fart', 'pussy palace', 'pussylicking', 'pussypounder', 'pussys', 'pust', 'puto', 'queaf', 'queef', 'queer', 'queerbait', 'queerhole', 'queero', 'queers', 'quicky', 'quim', 'r-tard', 'racy', 'raghead', 'raging boner', 'rape', 'raped', 'raper', 'rapey', 'raping', 'rapist', 'raunch', 'rectal', 'rectum', 'rectus', 'reefer', 'reetard', 'reich', 'renob', 'retard', 'retarded', 'reverse cowgirl', 'revue', 'rimjaw', 'rimjob', 'rimming', 'ritard', 'rosy palm', 'rosy palm and her 5 sisters', 'rtard', 'rubbish', 'rum', 'rump', 'rumprammer', 'ruski', 'rusty trombone', 's hit', 's_h_i_t', 's-h-1-t', 's-h-i-t', 's-o-b', 's.h.i.t.', 's.o.b.', 's&m', 's0b', 'sadism', 'sadist', 'sambo', 'sand nigger', 'sandbar', 'sandler', 'sandnigger', 'sanger', 'santorum', 'sausage queen', 'scag', 'scantily', 'scat', 'schizo', 'schlong', 'scissoring', 'screw', 'screwed', 'screwing', 'scroat', 'scrog', 'scrot', 'scrote', 'scrotum', 'scrud', 'scum', 'seaman', 'seamen', 'seduce', 'seks', 'semen', 'sex', 'sexo', 'sexual', 'sexy', 'sh!+', 'sh!t', 'sh1t', 'shag', 'shagger', 'shaggin', 'shagging', 'shamedame', 'shaved beaver', 'shaved pussy', 'shemale', 'shi+', 'shibari', 'shirt lifter', 'shit', 'shit ass', 'shit fucker', 'shitass', 'shitbag', 'shitbagger', 'shitblimp', 'shitbrains', 'shitbreath', 'shitcanned', 'shitcunt', 'shitdick', 'shite', 'shiteater', 'shited', 'shitey', 'shitface', 'shitfaced', 'shitfuck', 'shitfull', 'shithead', 'shitheads', 'shithole', 'shithouse', 'shiting', 'shitings', 'shits', 'shitspitter', 'shitstain', 'shitt', 'shitted', 'shitter', 'shitters', 'shittier', 'shittiest', 'shitting', 'shittings', 'shitty', 'shiz', 'shiznit', 'shota', 'shrimping', 'sissy', 'skag', 'skank', 'skeet', 'skullfuck', 'slag', 'slanteye', 'slave', 'sleaze', 'sleazy', 'slope', 'slut', 'slut bucket', 'slutbag', 'slutdumper', 'slutkiss', 'sluts', 'smartass', 'smartasses', 'smeg', 'smegma', 'smut', 'smutty', 'snatch', 'sniper', 'snowballing', 'snuff', 'sod off', 'sodom', 'sodomize', 'sodomy', 'son of a bitch', 'son of a motherless goat', 'son of a whore', 'son-of-a-bitch', 'souse', 'soused', 'spac', 'spade', 'sperm', 'spic', 'spick', 'spik', 'spiks', 'splooge', 'splooge moose', 'spooge', 'spook', 'spread legs', 'spunk', 'steamy', 'stfu', 'stiffy', 'stoned', 'strap on', 'strapon', 'strappado', 'strip', 'strip club', 'stroke', 'stupid', 'style doggy', 'suck', 'suckass', 'sucked', 'sucking', 'sucks', 'suicide girls', 'sultry women', 'sumofabiatch', 'swastika', 'swinger', 't1t', 't1tt1e5', 't1tties', 'taff', 'taig', 'tainted love', 'taking the piss', 'tampon', 'tard', 'tart', 'taste my', 'tawdry', 'tea bagging', 'teabagging', 'teat', 'teets', 'teez', 'terd', 'teste', 'testee', 'testes', 'testical', 'testicle', 'testis', 'threesome', 'throating', 'thrust', 'thug', 'thundercunt', 'tied up', 'tight white', 'tinkle', 'tit', 'tit wank', 'titfuck', 'titi', 'tities', 'tits', 'titt', 'tittie5', 'tittiefucker', 'titties', 'titty', 'tittyfuck', 'tittyfucker', 'tittywank', 'titwank', 'toke', 'tongue in a', 'toots', 'topless', 'tosser', 'towelhead', 'tramp', 'tranny', 'transsexual', 'trashy', 'tribadism', 'trumped', 'tub girl', 'tubgirl', 'turd', 'tush', 'tushy', 'tw4t', 'twat', 'twathead', 'twatlips', 'twats', 'twatty', 'twatwaffle', 'twink', 'twinkie', 'two fingers', 'two fingers with tongue', 'two girls one cup', 'twunt', 'twunter', 'ugly', 'unclefucker', 'undies', 'undressing', 'unwed', 'upskirt', 'urethra play', 'urinal', 'urine', 'urophilia', 'uterus', 'uzi', 'v14gra', 'v1gra', 'va-j-j', 'vag', 'vagina', 'vajayjay', 'valium', 'venus mound', 'veqtable', 'viagra', 'vibrator', 'violet wand', 'virgin', 'vixen', 'vjayjay', 'vodka', 'vomit', 'vorarephilia', 'voyeur', 'vulgar', 'vulva', 'w00se', 'wad', 'wang', 'wank', 'wanker', 'wankjob', 'wanky', 'wazoo', 'wedgie', 'weed', 'weenie', 'weewee', 'weiner', 'weirdo', 'wench', 'wet dream', 'wetback', 'wh0re', 'wh0reface', 'white power', 'whitey', 'whiz', 'whoar', 'whoralicious', 'whore', 'whorealicious', 'whorebag', 'whored', 'whoreface', 'whorehopper', 'whorehouse', 'whores', 'whoring', 'wigger', 'willies', 'willy', 'window licker', 'wiseass', 'wiseasses', 'wog', 'womb', 'woody', 'wop', 'wrapping men', 'wrinkled starfish', 'wtf', 'x-rated', 'xrated', 'xx', 'xxx', 'yaoi', 'yeasty', 'yellow showers', 'yid', 'yiffy', 'yobbo', 'zoophile', 'zoophilia', 'zubb', '2 Mädchen 1 Tasse', '2g1c', '4r5e', '5h1t', '5hit', 'a_s_s', 'a55', 'Akrotomophilie', 'Alabama Hot Pocket', 'Alaska Pipeline', 'Anal', 'Anilingus', 'Anus', 'Apeshit', 'Ar5e', 'Arsch', 'Arsch', 'Arschloch', 'Arsch', 'Arschficker', 'Arsch- hat', 'ass-jabber', 'ass-pirate', 'assbag', 'assbandit', 'assbanger', 'assbite', 'assclown', 'asscock', 'asscracker', 'arses', 'assface', 'assfuck', 'assfucker', 'assfukka', 'assgoblin', 'asshat', 'asshead', 'arschloch', 'arschlöcher', 'asshopper', 'assjacker', 'asslick', 'asslicker', 'assmonkey', 'assmunch', 'assmuncher', 'assnigger', 'asspirate', 'assshit', 'assshole', 'asssucker', 'asswad', 'asswhole', 'asswipe', 'auto erotische', 'autoerotic', 'axwound', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'babeland', 'baby batter', 'baby Juice', 'ball Knebel', 'Eiersoße', 'Eier treten', 'Eier lecken', 'Eiersack', 'Eier lutschen', 'Eiersack', 'Eier', 'Eiersack', 'Bampot', 'Bangbros', 'ohne Sattel', 'gerade noch legal', 'Barenaked', 'Bastard', 'Bastardo', 'Bastonade', 'BBW', 'Bdsm', 'Beaner', 'Beaners', 'bestialisch', 'Bestialität', 'Biberspalter', 'Biberlippen', 'Bellend', 'Bestial', 'Bestialität', 'Bi+Ch', 'Biatch', 'großer Schwarzer', 'große Brüste', 'große Klopfer', 'große Titten', 'Bimbos', 'Birdlock', 'Bitch', 'Bitchass', 'Bitcher', 'Bitchers', 'Bitches', 'Bitchin', 'Bitching', 'bitchtits', 'bitchy', 'schwarzer Schwanz', 'Blondine-Action', 'Blondine auf Blondine-Action', 'blutig', 'Blowjob', 'Blow Your Load', 'Blowjob', 'Blowjobs', 'Blue Waffle', 'Blumpkin', 'Boiolas', 'Bollock', 'Bollocks', 'Bollok', 'Bollox', 'Bondage', 'Boner', 'Boob', 'Boobs', 'boooobs', 'boooobs', 'boooooobs', 'boooooobs', 'booty call', 'Brüste', 'Züchter', 'Bruderfucker', 'braune Duschen', 'Brünette-Action', 'Buceta', 'Mist', 'Bukkake', 'Bulldyke', 'Bullet-Vibe', 'Bullshit', 'Bum', 'Bumblefuck', 'Spungloch', 'Spundloch', 'Bunny-Ficker', 'busty', 'butt', 'buttplug', 'butt-pirate', 'buttcheeks', 'buttfucka', 'buttfucker', 'butthole', 'buttmuch', 'buttplug', 'c0ck', 'c0cksucker', 'camel toe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'cawk', 'chesticle', 'chinc', 'chink', 'choad', 'Chocolate Rosebuds', 'Chode', 'Cipa', 'Circlejerk', 'Cl1t', 'Cleveland Steamer', 'Kitzler', 'Clitface', 'Clitfuck', 'Klitoris', 'Kitzler', 'Kleeklammern', 'Clusterfuck', 'Cnut', 'Schwanz', 'Schwanzlutscher', 'Cockass', 'Cockbite', 'Cockburger', 'Cockeye', 'Cockface', 'Cockfucker', 'Cockhead', 'cockjockey', 'cockknoker', 'cocklump', 'cockmaster', 'cockmongler', 'cockmongruel', 'cockmonkey', 'cockmunch', 'cockmuncher', 'cocknose', 'cocknugget', 'cocks', 'cockshit', 'cocksmith', 'cocksmoke', 'cocksmoker', 'cocksniffer', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cockwaffle', 'cok', 'cokmuncher', 'coksucka', 'coochie', 'coochy', 'coon', 'coons', 'cooter', 'coprolagnia', 'coprophilia', 'cornhole', 'cox', 'cracker', 'crap', 'creampie', 'crotte', 'cum', 'cumbubble', 'cumdumpster', 'cumguzzler', 'cumjockey', 'cummer', 'cumming', 'cums', 'cumshot', 'cumslut', 'cumtart', 'cunilingus', 'cunillingus', 'cunnie', 'cunnilingus', 'cunt', 'cuntass', 'cuntface', 'cunthole', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cuntrag', 'cunts', 'cuntslut', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'dago', 'damn', 'darkie', 'date rape', 'daterape', 'deep throat', 'deepthroat', 'deggo', 'dendrophilia', 'dick', 'dick-sneeze', 'dickbag', 'dickbeaters', 'dickface', 'dickfuck', 'dickfucker', 'dickhead', 'dickhole', 'dickjuice', 'dickmilk', 'dickmonger', 'dicks', 'dickslap', 'dicksucker', 'dicksucking', 'dicktickler', 'dickwad', 'dickweasel', 'dickweed', 'dickwod', 'dike', 'dildo', 'dildos', 'dingleberries', 'dingleberry', 'dink', 'dinks', 'dipshit', 'dirsa', 'dirty Pillows', 'dirty sanchez', 'dlck', 'dog style', 'dog-fucker', 'doggie style', 'doggiestyle', 'doggin', 'dogging', 'doggy style', 'doggystyle', 'dolcett', 'dominanz', 'dominatrix', 'dommes', 'donkeypunsch', 'donkeyribber', 'doochbag', 'dookie', 'doosh', 'double dong', 'doublepenetration', 'doublelift', 'douche', 'douche-fag', 'douchebag', 'douchewaffle', 'dp action', 'trockener Buckel', 'Duche', 'Dumass', 'dummer Arsch', 'Dummkopf', 'Dummfotze', 'Dummfick', 'Dummscheiße', 'Dumshit', 'DVD', 'Deich', 'iss meinen Arsch', 'Ecchi', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Erotik', 'Erotik', 'Begleitung', 'Eunuch', 'f u c k', 'f u c k e r', 'f_u_c_k', 'f4nny', 'fag', 'fagbag', 'fagfucker', 'fagging', 'faggit', 'faggitt', 'faggot', 'faggotcock', 'faggs', 'fagot', 'fagots', 'fags', 'fagtard', 'fanny', 'fannyflaps', 'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking', 'fäcal', 'feck', 'fecker', 'felch', 'felching', 'fellate', 'fellatio', 'filtch', 'female squirting', 'femdom', 'figging', 'fingerbang', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fingering', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'fisting', 'flamer', 'flange', 'foah', 'fook', 'fooker', 'foot fetish', 'footjob', 'frotting', 'fuck', 'fuck Buttons', 'fuck off', 'fucka', 'fuckass', 'fuckbag', 'fuckboy', 'fuckbrain', 'fuckbutt', 'fuckbutter', 'fucked', 'fucker', 'ficker', 'fuckersucker', 'fuckface', 'fuckhead', 'fuckheads', 'fuckhole', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fucknut', 'fucknutt', 'fuckoff', 'fucks', 'fuckstick', 'fucktard', 'fucktards', 'fucktart', 'fucktwat', 'fuckup', 'fuckwad', 'fuckwhit', 'fuckwit', 'fuckwitt', 'fudge packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'futanari', 'fux', 'fux0r', 'g-spot', 'gang bang', 'gangbang', 'gangbanged', 'gangbangs', 'gay', 'gay sex', 'gayass', 'gaybob', 'gaydo', 'gayfuck', 'gayfuckist', 'gaylord', 'gaysex', 'gaytard', 'gaywad', 'genitalien', 'riesenschwanz', 'girl on', 'girl on top', 'girls Gone wild', 'goatcx', 'goatse', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gokkun', 'goldene Dusche', 'goo girl', 'gooch', 'goodpoop', 'gook', 'goregasm', 'gringo', 'tappen', 'gruppensex', 'guido', 'guro', 'handjob', 'handjob', 'harter kern', 'hart auf', 'hardcore', 'hardcoresex', 'heeb', 'hell', 'hentai', 'heshe', 'ho', 'hoar', 'hoare', 'hoe', 'hoer', 'homo', 'homodumbshit', 'homoerotisch', 'honkey', 'nutte', 'hore', 'am geilsten', 'geil', 'hot carl', 'hot chick', 'hotsex', 'wie man tötet', 'wie man mordet', 'riesiges Fett', 'Humping', 'Inzest', 'Geschlechtsverkehr', 'Jack Off', 'Jack-off', 'Jackass', 'Jackoff', 'Jaggi', 'Jagoff', 'Jailbait', 'Jailbait', 'Jap', 'Jelly Donut', 'Jerk Off', 'Jerk-Off', 'Jerkass', 'Jigaboo', 'Jiggaboo', 'Jiggaboo', 'Jiggaboo', 'jism', 'jiz', 'jizm', 'jizz', 'jizzed', 'jock', 'juggs', 'jungle bunny', 'junglebunny', 'junkie', 'junky', 'kafir', 'kawk', 'kike', 'kikes', 'kill', 'kinbaku', 'kinkster', 'kinky', 'kkk', 'klan', 'knob', 'knob end', 'knobbing', 'knobead', 'knobed', 'knobend', 'knobhead', 'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kooch', 'kooches', 'kootch', 'kraut', 'kum', 'kummer', 'kumming', 'kums', 'kunilingus', 'kunja', 'kunt', 'kwif', 'kyke', 'l3i+ch', 'l3itch', 'Schamlippen', 'Lameass', 'Lardass', 'Lederfessel', 'Leder-Zwangsjacke', 'Lech', 'Zitronenparty', 'Aussätzige', 'Lesben', 'Lesben', 'Lesben', 'Lesben', 'Lez', 'Lezbian', 'Lezbians', 'Lezbo', 'Lezbos', 'Lezza', 'Lezzie', 'Lezzies', 'Lezzy', 'Lmao', 'LMFAO', 'loin', 'loins', 'lolita', 'looney', 'lovemaking', 'lube', 'lust', 'lusting', 'lusty', 'm-fucking', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8', 'ma5terbate', 'mafugly', 'make me come', 'male squirting', 'mams', 'masochist', 'massa', 'master-bate', 'masterb8', 'masterbat', 'masterbat3', 'masterbate', 'masterbating', 'masterbation', 'masterbations', 'masturbate', 'masturbating', 'masturbation', 'maxi', 'mcfagget', 'menage a trois', 'menses', 'menstruieren', 'menstruation', 'meth', 'mick', 'mittelfinger', 'midget', 'milf', 'minge', 'minger', 'Missionarsstellung', 'mo-fo', 'mof0', 'mofo', 'molest', 'mong', 'moo muh foo foo', 'moolie', 'idion', 'mothafuck', 'mothafucka', 'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings', 'mothafucks', 'motherfucker', 'motherfucks', 'Motherfucka', 'Motherfucked', 'Motherfucker', 'Motherfuckers', 'Motherfuckin', 'Motherfucking', 'Motherfuckings', 'Motherfuckka', 'Motherfucks', 'Mound of Venus', 'Mr Hands', 'Mtherfucker', 'Mthrfucker', 'Mthrfucking', 'Muff', 'Muff Diver', 'Muff Puff', 'Muffdiver', 'Muffdiving', 'Munging', 'Munter', 'Mord', 'mutha', 'muthafecker', 'muthafuckaz', 'muthafuckker', 'muther', 'mutherfucker', 'mutherfucking', 'muthrfucking', 'n1gga', 'n1gger', 'nad', 'nads', 'naked', 'nambla', 'napalm', 'nappy', 'nawashi', 'nazi', 'nazism', 'need the dick', 'negro', 'neonazi', 'nig nog', 'nig -nog', 'nigaboo', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger', 'niggers', 'niggle', 'niglet', 'nimphomania', 'nimrod', 'ninny', 'nipple', 'nipples', 'nob', 'nob jokey', 'nobhead', 'nobjocky', 'nobjokey', 'nonce', 'nooky', 'NSFW-Bilder', 'nackt', 'Nacktheit', 'Numbnuts', 'Nussbutter', 'Nusssack', 'Nutsack', 'Nutter', 'Nymphomanin', 'Nymphomanie', 'Oktopussy', 'alte Tasche', 'OMG', 'Omorashi', 'eine Tasse', 'zwei Mädchen', 'ein Mann', 'ein Glas', 'Opiat', 'Opium', 'oral', 'oral', 'Orgel', 'Orgasim', 'Orgasimen', 'Orgasmus', 'Orgasmus', 'Orgasmen', 'Orgien', 'Orgie', 'Eierstock', 'Eizelle', 'Eizellen', 'P.u.s.s.y.', 'P0rn', 'Paddy', 'Pädophile', 'Paki', 'Panooch', 'Stiefmütterchen', 'Höschen', 'Höschen', 'Höschen', 'Pastie', 'Pasty', 'Pawn', 'PCP', 'Pecker', 'Peckerhead', 'Pädo', 'Pedobear', 'Pädophilie', 'Pädophilie', 'Pädophilie', 'Natursekt', 'Peepee', 'Pegging', 'Penetration', 'Penetration', 'Penial', 'Penis', 'Penis', 'Penisbanger', 'Penisfucker', 'Penispuffer', 'Perversion', 'Peyote', 'Phalli', 'Phallic', 'Telefonsex', 'Telefonsex', 'Phuck Phuk Pisser', 'Pisse', 'Pissflaps', 'Pissin', 'Pissen', 'Pissoff', 'Pisspig', 'Playboy', 'Vergnügungskiste', 'PMS', 'Polack', 'Pole Smoker', 'Polesmoker', 'Pollock', 'Ponyplay', 'Poof', 'Poon', 'Poonani', 'Poonany', 'Poontang', 'Poop', 'Poop Chute', 'Poopchute', 'Poopuncher', 'porch Monkey', 'porchmonkey', 'porn', 'porno', 'pornography', 'pornos', 'pot', 'potty', 'prick', 'pricks', 'prickteaser', 'prig', 'prince albert piercing', 'prod', 'pron', 'prostitute', 'prude', 'psycho', 'pthc', 'pube', 'pubes', 'pubic', 'pubis', 'punani', 'punanny', 'punany', 'punkass', 'punky', 'punta', 'puss', 'pusse', 'pussi', 'pussies', 'pussy', 'pussy furz', 'pussy Palace', 'pussylicking', 'pussypounder', 'pussys', 'pust', 'puto', 'queaf', 'queef', 'queer', 'queerbait', 'queerhole', 'queero', 'queers', 'quicky', 'quim', 'r-tard', 'racy', 'raghead', 'raging boner', 'rape', 'raped', 'raper', 'rapey', 'raping', 'rapist', 'raunch', 'rektal', 'rektum', 'rectus', 'reefer', 'reetard', 'reich', 'renob', 'retard', 'retarded', 'reverse cowgirl', 'revue', 'rimjaw', 'rimjob', 'rimming', 'ritard', 'rosy palm', 'rosy palm und ihre 5 schwestern', 'rtard', 'rubbish', 'rum', 'rump', 'rumprammer', 'ruski', 'rusty posaune', 's hit', 's_h_i_t', 's-h-1-t', 's-h-i-t', 's-o-b', 's.h.i.t.', 's.o.b.', 's&m', 's0b', 'sadism', 'sadist', 'sambo', 'sand nigger', 'sandbar', 'sandler', 'sandnigger', 'sanger', 'santorum', 'sausage queen', 'scag', 'spärlich', 'scat', 'schizo', 'schlong', 'scissoring', 'screw', 'screwed', 'screwing', 'scroat', 'scrog', 'scrot', 'scrote', 'scrotum', 'scrud', 'scum', 'seaman', 'seamen', 'seduce', 'seks', 'serma', 'sex', 'sexo', 'sexual', 'sexy', 'sh!+', 'sh!t', 'sh1t', 'shag', 'shagger', 'shaggin', 'shagging', 'shadame', 'shaved beaver', 'rasierte muschi', 'shemale', 'shi+', 'shibari', 'shirtlifter', 'shit', 'shit ass', 'shit ficker', 'shitass', 'shitbag', 'shitbagger', 'shitblimp', 'shitbrains', 'shitbreath', 'shitcanned', 'shitcunt', 'shitdick', 'shit', 'shiteater', 'shit', 'shitey', 'shitface', 'shitfaced', 'shitfuck', 'shitfull', 'shithead', 'shitheads', 'shithole', 'shithouse', 'shiting', 'shitings', 'shits', 'shitspitter', 'shitstain', 'shit', 'shitted', 'shitter', 'shitters', 'shittier', 'shittiest', 'shitting', 'shittings', 'shitty', 'shiz', 'shiznit', 'shota', 'shrimping', 'sissy', 'skag', 'skank', 'skeet', 'skullfuck', 'slag', 'slanteye', 'slave', 'sleaze', 'sleazy', 'slope', 'slut', 'slut Bucket', 'slutbag', 'slutdumper', 'slutkiss', 'sluts', 'smartass', 'smartasses', 'smeg', 'smegma', 'smut', 'smutty', 'schnappen', 'Scharfschütze', 'Schneeball', 'Schnupftabak', 'verpiss dich', 'Sodom', 'Sodomisieren', 'Sodomie', 'Hurensohn', 'Sohn einer mutterlosen Ziege', 'Hurensohn', 'Hurensohn', 'besudelt', 'spachtel', 'Spaten', 'Sperma', 'spic', 'spick', 'spik', 'spiks', 'splooge', 'splooge moose', 'spooge', 'spook', 'spreizbeine', 'spunk', 'dampfend', 'stfu', 'steif', 'stoned', 'umschnalldildo', 'strapon', 'strappado', 'strip', 'stripclub', 'streicheln', 'dumm', 'style doggy', 'saugen', 'Suckass', 'gelutscht', 'saugen', 'saugt', 'Selbstmordmädchen', 'schwüle Frauen', 'Sumofabiatch', 'Hakenkreuz', 'Swinger', 'T1t', 'T1tt1e5', 'T1tties', 'Taff', 'Taig', 'verdorbene Liebe', 'die Pisse nehmen', 'Tampon', 'Tard', 'Torte', 'schmecken mein', 'Tawdry', 'Teebeutel', 'Teebeutel', 'Sauger', 'Tees', 'Teez', 'Terd', 'Hoden', 'Hoden', 'Hoden', 'Hoden', 'Hoden', 'Hoden', 'Dreier', 'Kehlenfick', 'Stoß', 'Schläger', 'Donnerfotze', '2 Mädchen 1 Tasse', '2g1c', '4r5e', '5h1t', '5hit', 'a_s_s', 'a55', 'Akrotomophilie', 'Alabama Hot Pocket', 'Alaska Pipeline', 'Anal', 'Anilingus', 'Anus', 'Apeshit', 'Ar5e', 'Arsch', 'Arsch', 'Arschloch', 'Arsch', 'Arschficker', 'Arsch- hat', 'ass-jabber', 'ass-pirate', 'assbag', 'assbandit', 'assbanger', 'assbite', 'assclown', 'asscock', 'asscracker', 'arses', 'assface', 'assfuck', 'assfucker', 'assfukka', 'assgoblin', 'asshat', 'asshead', 'arschloch', 'arschlöcher', 'asshopper', 'assjacker', 'asslick', 'asslicker', 'assmonkey', 'assmunch', 'assmuncher', 'assnigger', 'asspirate', 'assshit', 'assshole', 'asssucker', 'asswad', 'asswhole', 'asswipe', 'auto erotische', 'autoerotic', 'axwound', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'babeland', 'baby batter', 'baby Juice', 'ball Knebel', 'Eiersoße', 'Eier treten', 'Eier lecken', 'Eiersack', 'Eier lutschen', 'Eiersack', 'Eier', 'Eiersack', 'Bampot', 'Bangbros', 'ohne Sattel', 'gerade noch legal', 'Barenaked', 'Bastard', 'Bastardo', 'Bastonade', 'BBW', 'Bdsm', 'Beaner', 'Beaners', 'bestialisch', 'Bestialität', 'Biberspalter', 'Biberlippen', 'Bellend', 'Bestial', 'Bestialität', 'Bi+Ch', 'Biatch', 'großer Schwarzer', 'große Brüste', 'große Klopfer', 'große Titten', 'Bimbos', 'Birdlock', 'Bitch', 'Bitchass', 'Bitcher', 'Bitchers', 'Bitches', 'Bitchin', 'Bitching', 'bitchtits', 'bitchy', 'schwarzer Schwanz', 'Blondine-Action', 'Blondine auf Blondine-Action', 'blutig', 'Blowjob', 'Blow Your Load', 'Blowjob', 'Blowjobs', 'Blue Waffle', 'Blumpkin', 'Boiolas', 'Bollock', 'Bollocks', 'Bollok', 'Bollox', 'Bondage', 'Boner', 'Boob', 'Boobs', 'boooobs', 'boooobs', 'boooooobs', 'boooooobs', 'booty call', 'Brüste', 'Züchter', 'Bruderfucker', 'braune Duschen', 'Brünette-Action', 'Buceta', 'Mist', 'Bukkake', 'Bulldyke', 'Bullet-Vibe', 'Bullshit', 'Bum', 'Bumblefuck', 'Spungloch', 'Spundloch', 'Bunny-Ficker', 'busty', 'butt', 'buttplug', 'butt-pirate', 'buttcheeks', 'buttfucka', 'buttfucker', 'butthole', 'buttmuch', 'buttplug', 'c0ck', 'c0cksucker', 'camel toe', 'camgirl', 'camslut', 'camwhore', 'carpet muncher', 'carpetmuncher', 'cawk', 'chesticle', 'chinc', 'chink', 'choad', 'Chocolate Rosebuds', 'Chode', 'Cipa', 'Circlejerk', 'Cl1t', 'Cleveland Steamer', 'Kitzler', 'Clitface', 'Clitfuck', 'Klitoris', 'Kitzler', 'Kleeklammern', 'Clusterfuck', 'Cnut', 'Schwanz', 'Schwanzlutscher', 'Cockass', 'Cockbite', 'Cockburger', 'Cockeye', 'Cockface', 'Cockfucker', 'Cockhead', 'cockjockey', 'cockknoker', 'cocklump', 'cockmaster', 'cockmongler', 'cockmongruel', 'cockmonkey', 'cockmunch', 'cockmuncher', 'cocknose', 'cocknugget', 'cocks', 'cockshit', 'cocksmith', 'cocksmoke', 'cocksmoker', 'cocksniffer', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cockwaffle', 'cok', 'cokmuncher', 'coksucka', 'coochie', 'coochy', 'coon', 'coons', 'cooter', 'coprolagnia', 'coprophilia', 'cornhole', 'cox', 'cracker', 'crap', 'creampie', 'crotte', 'cum', 'cumbubble', 'cumdumpster', 'cumguzzler', 'cumjockey', 'cummer', 'cumming', 'cums', 'cumshot', 'cumslut', 'cumtart', 'cunilingus', 'cunillingus', 'cunnie', 'cunnilingus', 'cunt', 'cuntass', 'cuntface', 'cunthole', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cuntrag', 'cunts', 'cuntslut', 'cyalis', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'dago', 'damn', 'darkie', 'date rape', 'daterape', 'deep throat', 'deepthroat', 'deggo', 'dendrophilia', 'dick', 'dick-sneeze', 'dickbag', 'dickbeaters', 'dickface', 'dickfuck', 'dickfucker', 'dickhead', 'dickhole', 'dickjuice', 'dickmilk', 'dickmonger', 'dicks', 'dickslap', 'dicksucker', 'dicksucking', 'dicktickler', 'dickwad', 'dickweasel', 'dickweed', 'dickwod', 'dike', 'dildo', 'dildos', 'dingleberries', 'dingleberry', 'dink', 'dinks', 'dipshit', 'dirsa', 'dirty Pillows', 'dirty sanchez', 'dlck', 'dog style', 'dog-fucker', 'doggie style', 'doggiestyle', 'doggin', 'dogging', 'doggy style', 'doggystyle', 'dolcett', 'dominanz', 'dominatrix', 'dommes', 'donkeypunsch', 'donkeyribber', 'doochbag', 'dookie', 'doosh', 'double dong', 'doublepenetration', 'doublelift', 'douche', 'douche-fag', 'douchebag', 'douchewaffle', 'dp action', 'trockener Buckel', 'Duche', 'Dumass', 'dummer Arsch', 'Dummkopf', 'Dummfotze', 'Dummfick', 'Dummscheiße', 'Dumshit', 'DVD', 'Deich', 'iss meinen Arsch', 'Ecchi', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Ejakulation', 'Erotik', 'Erotik', 'Begleitung', 'Eunuch', 'f u c k', 'f u c k e r', 'f_u_c_k', 'f4nny', 'fag', 'fagbag', 'fagfucker', 'fagging', 'faggit', 'faggitt', 'faggot', 'faggotcock', 'faggs', 'fagot', 'fagots', 'fags', 'fagtard', 'fanny', 'fannyflaps', 'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking', 'fäcal', 'feck', 'fecker', 'felch', 'felching', 'fellate', 'fellatio', 'filtch', 'female squirting', 'femdom', 'figging', 'fingerbang', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fingering', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'fisting', 'flamer', 'flange', 'foah', 'fook', 'fooker', 'foot fetish', 'footjob', 'frotting', 'fuck', 'fuck Buttons', 'fuck off', 'fucka', 'fuckass', 'fuckbag', 'fuckboy', 'fuckbrain', 'fuckbutt', 'fuckbutter', 'fucked', 'fucker', 'ficker', 'fuckersucker', 'fuckface', 'fuckhead', 'fuckheads', 'fuckhole', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fucknut', 'fucknutt', 'fuckoff', 'fucks', 'fuckstick', 'fucktard', 'fucktards', 'fucktart', 'fucktwat', 'fuckup', 'fuckwad', 'fuckwhit', 'fuckwit', 'fuckwitt', 'fudge packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'futanari', 'fux', 'fux0r', 'g-spot', 'gang bang', 'gangbang', 'gangbanged', 'gangbangs', 'gay', 'gay sex', 'gayass', 'gaybob', 'gaydo', 'gayfuck', 'gayfuckist', 'gaylord', 'gaysex', 'gaytard', 'gaywad', 'genitalien', 'riesenschwanz', 'girl on', 'girl on top', 'girls Gone wild', 'goatcx', 'goatse', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gottverdammt', 'gokkun', 'goldene Dusche', 'goo girl', 'gooch', 'goodpoop', 'gook', 'goregasm', 'gringo', 'tappen', 'gruppensex', 'guido', 'guro', 'handjob', 'handjob', 'harter kern', 'hart auf', 'hardcore', 'hardcoresex', 'heeb', 'hell', 'hentai', 'heshe', 'ho', 'hoar', 'hoare', 'hoe', 'hoer', 'homo', 'homodumbshit', 'homoerotisch', 'honkey', 'nutte', 'hore', 'am geilsten', 'geil', 'hot carl', 'hot chick', 'hotsex', 'wie man tötet', 'wie man mordet', 'riesiges Fett', 'Humping', 'Inzest', 'Geschlechtsverkehr', 'Jack Off', 'Jack-off', 'Jackass', 'Jackoff', 'Jaggi', 'Jagoff', 'Jailbait', 'Jailbait', 'Jap', 'Jelly Donut', 'Jerk Off', 'Jerk-Off', 'Jerkass', 'Jigaboo', 'Jiggaboo', 'Jiggaboo', 'Jiggaboo', 'gefesselt', 'eng weiß', 'klingeln', 'Titten', 'Titten wichsen', 'Tittenfick', 'Titi', 'Tities', 'Titten', 'Titten', 'Tittie5', 'Tittiefucker', 'Titten', 'Titten', 'Tittenfick', 'Tittenfick', 'Tittenfick', 'Tittenfick', 'Toke', 'Zunge in einem', 'Toots', 'oben ohne', 'Tosser', 'towelhead', 'tramp', 'tranny', 'transsexual', 'trashy', 'tribadism', 'trumped', 'tub girl', 'tubgirl', 'turd', 'tush', 'tushy', 'tw4t', 'twat', 'twathead', 'twatlips', 'twats', 'twatty', 'twatwaffle', 'twink', 'twinkie', 'two fingers', 'two finger with Zunge', 'zwei Mädchen eine Tasse', 'Twunt', 'Twunter', 'hässlich', 'Onkelficker', 'Unterwäsche', 'Ausziehen', 'unverheiratet', 'Upskirt', 'Harnröhrenspiel', 'Urinal', 'Urin', 'Urophilie', 'Gebärmutter', 'Uzi', 'V14gra', 'V1gra', 'Va-J-J', 'VAG', 'Vagina', 'Vajayjay', 'Valium', 'Venus Mound', 'Veqtable', 'Viagra', 'Vibrator', 'Violett Zauberstab', 'Jungfrau', 'Füchsin', 'Vjayjay', 'Wodka', 'Erbrochenes', 'Vorarephilie', 'Voyeur', 'vulgär', 'Vulva', 'W00se', 'Wad', 'Wang', 'Wichser', 'Wichser', 'Wichsjob', 'Wichser', 'Wazoo', 'Wedgie', 'weed', 'weenie', 'weewee', 'weiner', 'weirdo', 'girl', 'wet dream', 'wetback', 'wh0re', 'wh0reface', 'white power', 'whitey', 'whiz', 'whoar', 'whoralicious', 'whore', 'whorealicious', 'whorebag', 'whored', 'whoreface', 'whorehopper', 'whorehouse', 'hures', 'huring', 'Perücke yobbo', 'zoophil', 'zoophilie', 'zubb'); // Customize the list of bad words


  // Fetch user data when the session is available
  useEffect(() => {
    if (session?.user) {
      // Assuming you have a "users" collection
      const userDocRef = doc(db, 'users', session.user.uid);

      // Fetch the user's data from Firestore
      const fetchData = async () => {
        try {
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userDocData = userDocSnapshot.data();
            setUserData(userDocData); // Set user data in state
          }
        } catch (error) {
          toast.error('Error fetching user data');
        }
      };

      fetchData();
    }
  }, [session]);

  const handleMentionInputChange = (e) => {
    const inputValue = e.target.value;
    setInput(inputValue);

    // Check if the user has typed @
    if (inputValue.includes('@')) {
      const mentionIndex = inputValue.lastIndexOf('@');
      setMentionStartIndex(mentionIndex);
      setMentionInput(inputValue.substring(mentionIndex + 1));
    } else {
      setUserSuggestions([]);
    }
  };

  useEffect(() => {
    // Function to shuffle an array randomly
    const shuffleArray = (array) => {
      let currentIndex = array.length,
        randomIndex,
        tempValue;

      while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap elements
        tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
      }

      return array;
    };

    const fetchUserSuggestions = async () => {
      if (mentionStartIndex !== null) {
        try {
          const usersCollectionRef = collection(db, 'users');
          const q = query(usersCollectionRef, where('name', '>=', mentionInput), where('name', '<=', mentionInput + '\uf8ff'));
          const querySnapshot = await getDocs(q);

          const users = querySnapshot.docs.map((doc) => doc.data());

          // Shuffle the users array randomly
          const shuffledUsers = shuffleArray(users);

          // Limit the number of user suggestions to 4
          const limitedUserSuggestions = shuffledUsers.slice(0, 4);

          setUserSuggestions(limitedUserSuggestions);
        } catch (error) {
          console.error('Error fetching user suggestions:', error);
        }
      }
    };

    fetchUserSuggestions();
  }, [mentionInput, mentionStartIndex]);

  const handleUserMentionSelect = (user) => {
    const mentionIndex = mentionStartIndex !== null ? mentionStartIndex : 0;
    const inputValue =
      input.substring(0, mentionIndex) +
      `@${user.tag} ` +
      input.substring(mentionIndex + mentionInput.length + 1);

    setInput(inputValue);
    setUserSuggestions([]);
  };

  const handleHashtagInputChange = (e) => {
    const hashtagValue = e.target.value;
    setHashtagInput(hashtagValue);

    // Check if the user has typed #
    if (hashtagValue.includes('#')) {
      const hashtagIndex = hashtagValue.lastIndexOf('#');
      const currentHashtag = hashtagValue.substring(hashtagIndex + 1);

      // Fetch hashtag suggestions based on current input
      fetchHashtagSuggestions(currentHashtag);
    } else {
      setHashtagSuggestions([]);
    }
  };

  const fetchHashtagSuggestions = async (currentHashtag) => {
    try {
      const hashtagsCollectionRef = collection(db, 'hashtags');
      const q = query(hashtagsCollectionRef, where('name', '>=', currentHashtag), where('name', '<=', currentHashtag + '\uf8ff'));
      const querySnapshot = await getDocs(q);

      const hashtags = querySnapshot.docs.map((doc) => doc.data());

      setHashtagSuggestions(hashtags);
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
    }
  };

  const handleHashtagSelect = (hashtag) => {
    const inputValue = input + `#${hashtag.name} `;
    setInput(inputValue);
    setHashtagSuggestions([]);
  };

  const createNewHashtag = async () => {
    if (hashtagInput.trim() === '') {
      return;
    }

    try {
      // Add the new hashtag to Firestore
  {/*    const hashtagsCollectionRef = collection(db, 'hashtags');
      await addDoc(hashtagsCollectionRef, {
        name: hashtagInput.trim(),
        timestamp: serverTimestamp(),
      });
    */}
      // Append the new hashtag to the input
      const inputValue = input + `${hashtagInput.trim()} `;
      setInput(inputValue);
      setHashtagInput('');
      setHashtagSuggestions([]);
      // Store the hashtag temporarily
      setTempHashtags([...tempHashtags, `${hashtagInput.trim()}`]);
    } catch (error) {
      console.error('Error creating new hashtag:', error);
    }
  };

  const addVideoToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedVideo(readerEvent.target.result);
    };
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const addEmoji = (e) => {
    let sym = e.unified.split('-');
    let codesArray = [];
    sym.forEach((el) => codesArray.push('0x' + el));
    let emoji = String.fromCodePoint(...codesArray);
    setInput(input + emoji);
  };

  const sendPost = async () => {
    if (loading) return;

    setLoading(true);

    // Check for offensive content
    if (filter.isProfane(input)) {
      toast.error('Your post contains offensive content.');
      setLoading(false);
      return;
    }
  

    if (!userData) {
      toast.error('User data is not available.');
      setLoading(false);
      return;
    }

    // Check for mentions in the input text
    const mentionRegex = /@(\w+)/g;
    const mentions = input.match(mentionRegex);

    const docRef = await addDoc(collection(db, 'posts'), {
      id: userData.id,
      username: userData.name,
      userImg: userData.profileImage,
      tag: userData.tag,
      text: input,
      timestamp: serverTimestamp(),
      postedById: userData.id,
      isVerified: userData.isVerified || false,
      isQualifiedForBadge: userData.isQualifiedForBadge || false,
      isQualifiedForGoldBadge: userData.isQualifiedForGoldBadge || false,
    });

    const imageRef = ref(storage, `posts/${docRef.id}/image`);

    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url')
        .then(async () => {
          const downloadURL = await getDownloadURL(imageRef);
          await updateDoc(doc(db, 'posts', docRef.id), {
            image: downloadURL,
          });
        })
        .catch((error) => {
          toast.error('Error uploading image');
        });
    }

    const videoRef = ref(storage, `posts/${docRef.id}/video`);

    if (selectedVideo) {
      await uploadString(videoRef, selectedVideo, 'data_url')
        .then(async () => {
          const downloadURL = await getDownloadURL(videoRef);
          await updateDoc(doc(db, 'posts', docRef.id), {
            video: downloadURL,
          });
        })
        .catch((error) => {
          toast.error('Error uploading video');
        });
    }

    // Check for mentions and send notifications
    if (mentions) {
      mentions.forEach(async (mention) => {
        // Extract the username from the mention (remove '@' character)
        const username = mention.slice(1);

        // Find the user with the mentioned username
        const userQuery = query(collection(db, 'users'), where('tag', '==', username));
        const userQuerySnapshot = await getDocs(userQuery);

        userQuerySnapshot.forEach(async (userDoc) => {
          // Create a notification for the mentioned user
          const mentionedUserId = userDoc.id;

          await addDoc(collection(db, 'notifications'), {
            senderUserId: userData.id,
            recipientUserId: mentionedUserId,
            postId: docRef.id, // Include the post ID here
            type: 'tag',
            senderName: session.user.name,
            senderImage: session.user.image,
            message:  'tagged you in a recent post.',
            timestamp: new Date(),
            read: false,
          });
        });
      });
    }

    // Store hashtags in the "hashtags" collection
    tempHashtags.forEach(async (tempHashtag) => {
      try {
        // Add the new hashtag to Firestore
        const hashtagsCollectionRef = collection(db, 'hashtags');
        await addDoc(hashtagsCollectionRef, {
          postId: docRef.id,
          name: tempHashtag.substring(1), // Remove the '#' character
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error creating new hashtag:', error);
      }
    });


    // Clear temporary hashtags and input
    setTempHashtags([]);
    setInput('');
    setSelectedFile(null);
    setSelectedVideo(null);
    setShowEmojis(false);

    toast.success('Your post was sent!');
    setLoading(false);
  };

  return (
    <div className={`mt-4 px-4 ${loading && 'opacity-60'}`}>
      <div className="grid grid-cols-[48px,1fr] gap-4">
        <div>
          <img className="h-12 w-12 rounded-full object-contain" src={session?.user?.image} alt="" />
        </div>

        <div className="w-[90%]">
          <textarea
            className="w-[100%] bg-transparent outline-none text-[20px] no-scrollbar"
            rows="2"
            placeholder="What's Happening?"
            value={input}
            onChange={handleMentionInputChange}
          />

          {selectedFile && (
            <div className="relative mb-4">
              <div className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer" onClick={() => setSelectedFile(null)}>
                <AiOutlineClose className="text-white h-5" />
              </div>

              <img src={selectedFile} alt="" className="rounded-2xl max-h-80 object-contain" />
            </div>
          )}

          {selectedVideo && (
            <div className="relative mb-4">
              <div
                className="absolute w-8 h-8 bg-[#15181c] hover:[#272c26] bg-opacity-75 rounded-full flex items-center justify-center top-1 left-1 cursor-pointer"
                onClick={() => setSelectedVideo(null)}
              >
                <AiOutlineClose className="text-white h-5" />
              </div>
              <video controls src={selectedVideo} className="rounded-2xl max-h-80"></video>
            </div>
          )}

          {!loading && (
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-[20px] text-yellow-500">
                <label htmlFor="file">
                  <BsImage className="cursor-pointer" />
                </label>

                <input id="file" type="file" accept="image/*"  hidden onChange={addImageToPost} />

                <label htmlFor="video">
                  <AiOutlineVideoCameraAdd className="cursor-pointer" />
                </label>
                <input id="video" type="file" accept="video/*" hidden onChange={addVideoToPost} />

                <BsEmojiSmile className='cursor-pointer' onClick={() => setShowEmojis(!showEmojis)} />
              </div>

              <button
                className="bg-yellow-500 text-white rounded-full px-4 py-1.5 font-bold shadow-md hover:bg-yellow-400 disabled:hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-default"
                disabled={!input.trim() && !selectedFile}
                onClick={sendPost}
              >
                Write
              </button>
            </div>
          )}

{showEmojis && (
                        <div className='absolute mt-[10px] -ml-[40px] max-w-[320px] rounded-[20px]'>
                            <Picker
                                onEmojiSelect={addEmoji}
                                data={data}

                                theme="dark"
                            />
                        </div>
                    )}

          {userSuggestions.length > 0 && (
            <div className="mt-2 max-h-20 overflow-y-auto border rounded-md p-2 absolute bg-white shadow-md z-10 no-scrollbar">
              {userSuggestions.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
                  onClick={() => handleUserMentionSelect(user)}
                >
                  <img src={user.profileImage} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          )}

          {hashtagSuggestions.length > 0 && (
            <div className="mt-2 max-h-20 overflow-y-auto border rounded-md p-2 absolute bg-white shadow-md z-10 no-scrollbar">
              {hashtagSuggestions.map((hashtag) => (
                <div
                  key={hashtag.id}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded-md"
                  onClick={() => handleHashtagSelect(hashtag)}
                >
                  <span className="text-blue-500">#</span>
                  <span>{hashtag.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center">
            <input
              type="text"
              className="w-[100%] bg-transparent outline-none text-[15px] no-scrollbar"
              placeholder="Add hashtags"
              value={hashtagInput}
              onChange={handleHashtagInputChange}
              onBlur={createNewHashtag}
            />
          </div>

          {tempHashtags.length > 0 && (
            <div className="mt-2 flex items-center">
              <div className="text-gray-500">
                {tempHashtags.map((tag) => (
                  <span key={tag} className="mr-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Input;