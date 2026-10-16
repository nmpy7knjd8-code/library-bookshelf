/** Full Library bookshelf catalog — every title from bookshelf-catalog.md */

export const shelves = [
  {
    id: 'philosophy',
    label: 'Philosophy & Thought',
    category: 'Philosophy, metaphysics, religion, and related thought',
    books: [
      {
        title: 'The World as Will and Representation, Vol. I',
        spine: 'World as Will I',
        author: 'Arthur Schopenhauer',
        description:
          'Schopenhauer’s central work argues that the world appears as representation shaped by the subject, while its inner nature is blind, striving will. Volume I sets out the fourfold root of the principle of sufficient reason, aesthetic contemplation, and the path of denial of the will. It remains a landmark of post-Kantian metaphysics and pessimism.',
      },
      {
        title: 'Ideas',
        spine: 'Ideas',
        author: 'Edmund Husserl',
        description:
          'Husserl’s Ideas introduces transcendental phenomenology: a method of bracketing the natural attitude to describe pure consciousness and its intentional structures. The work elaborates the phenomenological reduction, noesis and noema, and the constitution of objectivity. It shaped twentieth-century continental philosophy and debates about experience.',
      },
      {
        title: 'Critique of Pure Reason',
        spine: 'Critique of Pure Reason',
        author: 'Immanuel Kant',
        description:
          'Kant’s first Critique asks how synthetic a priori knowledge is possible and redraws the bounds of metaphysics. Through the transcendental aesthetic, analytic, and dialectic, he argues that space, time, and the categories structure experience while reason’s speculative claims lead to antinomies. It is the cornerstone of modern critical philosophy.',
      },
      {
        title: 'Difference and Repetition',
        spine: 'Diff. & Repetition',
        author: 'Gilles Deleuze',
        description:
          'Deleuze rethinks identity by elevating difference and repetition over resemblance and generality. Drawing on Bergson, Nietzsche, and Kant, he develops a philosophy of intensive becoming, virtual multiplicities, and creative repetition. The book is a key text of twentieth-century French philosophy.',
      },
      {
        title: 'Logic',
        spine: 'Logic',
        author: 'Martin Heidegger',
        description:
          'Heidegger’s lecture course on logic treats logos not as formal calculation but as the disclosure of being. He revisits Aristotle, Kant, and Husserl to show how truth, judgment, and language are rooted in Dasein’s understanding of world. The volume bridges his early phenomenology and later thinking of language.',
      },
      {
        title: 'Being and Time',
        spine: 'Being and Time',
        author: 'Martin Heidegger',
        description:
          'Heidegger’s magnum opus analyzes Dasein—human existence—as the site where the question of Being is raised. Through being-in-the-world, care, authenticity, and being-toward-death, he offers a fundamental ontology that transformed existentialism and hermeneutics. Though unfinished, it remains one of the most influential books of the twentieth century.',
      },
      {
        title: 'Ethics',
        spine: 'Ethics',
        author: 'Benedict de Spinoza',
        description:
          'Written in geometric form, Spinoza’s Ethics presents God or Nature as a single infinite substance of which mind and body are attributes. It unfolds a deterministic metaphysics, a psychology of the affects, and an ethics of understanding that culminates in blessedness. The work is a classic of rationalist philosophy and political freedom.',
      },
      {
        title: 'History of Political Philosophy',
        spine: 'Hist. Pol. Phil.',
        author: 'Edited by Leo Strauss and Joseph Cropsey',
        description:
          'This collection surveys major political thinkers from Plato and Aristotle through modern liberalism and beyond. Strauss and Cropsey’s editorial framing emphasizes close reading of foundational texts and the tension between ancient and modern political thought. It has long served as a standard companion for students of the tradition.',
      },
      {
        title: 'The Metaphysics',
        spine: 'Metaphysics',
        author: 'Aristotle (tr. Hugh Lawson-Tancred, Penguin Classics)',
        description:
          'Aristotle’s Metaphysics investigates being as being, substance, cause, and the unmoved mover. It gathers earlier inquiries into first principles and offers the classic account of form, matter, potentiality, and actuality. The text shaped scholastic theology and remains central to ontology.',
      },
      {
        title: 'Oxford Student’s Aristotle, Vol. V: Ethics',
        spine: 'Aristotle Ethics',
        author: 'Aristotle (Oxford Student’s edition)',
        description:
          'This student volume presents Aristotle’s ethical teaching—virtue as habit, the mean, friendship, and contemplative happiness—in a form suited to close study. It belongs to the Nicomachean tradition that defined Western moral philosophy. The edition highlights the practical wisdom (phronesis) at the heart of the good life.',
      },
      {
        title: 'The Philosophy of History',
        spine: 'Phil. of History',
        author: 'G. W. F. Hegel (tr. J. Sibree)',
        description:
          'Hegel’s lectures portray world history as the progressive realization of freedom in spirit. From Oriental despotism through classical Greece and Rome to the modern Germanic world, reason works itself out in institutions and peoples. Sibree’s English translation helped fix Hegel’s historical vision for Anglophone readers.',
      },
      {
        title: 'The Technological Society',
        spine: 'Tech. Society',
        author: 'Jacques Ellul',
        description:
          'Ellul argues that technique—efficient, self-augmenting method—has become the defining environment of modern civilization. Technology is not a neutral tool but a system that reorganizes politics, work, and culture around efficiency. The book is a foundational critique of technological determinism and mass society.',
      },
      {
        title: 'Limits to Medicine',
        spine: 'Limits to Medicine',
        author: 'Ivan Illich',
        description:
          'Illich’s Medical Nemesis (published as Limits to Medicine) contends that clinical institutions can generate iatrogenic harm and strip people of autonomous care. He distinguishes clinical, social, and cultural iatrogenesis and calls for limits on medicalization. The book remains a sharp challenge to professional monopoly over health.',
      },
      {
        title: 'Ride the Tiger',
        spine: 'Ride the Tiger',
        author: 'Julius Evola',
        description:
          'Evola offers counsel for living amid what he sees as a dissolving modern age without surrendering to it. Drawing on traditionalist metaphysics, he urges an interior “riding of the tiger” rather than futile restoration of lost forms. The book is among his most read late works on spiritual aristocracy and modernity.',
      },
      {
        title: 'Revolt Against the Modern World',
        spine: 'Revolt vs Modern',
        author: 'Julius Evola',
        description:
          'A sweeping traditionalist critique contrasting a hierarchical sacred order with modern egalitarianism and materialism. Evola surveys myth, royalty, caste, and initiation as signs of a lost world, then diagnoses decline. Controversial and influential in far-right esoteric circles, it maps his full historical-metaphysical vision.',
      },
      {
        title: 'The Sacred and the Profane',
        spine: 'Sacred & Profane',
        author: 'Mircea Eliade',
        description:
          'Eliade contrasts sacred space and time with the homogeneous world of the profane. Through myth, ritual, and symbolism, he shows how religious experience orients human dwelling and renewal. The short book is a classic introduction to the phenomenology of religion.',
      },
      {
        title: 'Simulacra and Simulation',
        spine: 'Simulacra',
        author: 'Jean Baudrillard',
        description:
          'Baudrillard argues that late modernity replaces reality with models and signs that precede and produce the real—the precession of simulacra. Hyperreality, Disneyland, and media copies become more persuasive than originals. The essay shaped postmodern theory and cultural criticism of media societies.',
      },
      {
        title: 'Tractatus Logico-Philosophicus',
        spine: 'Tractatus',
        author: 'Ludwig Wittgenstein',
        description:
          'Wittgenstein’s early masterpiece proposes that the world is the totality of facts and that language pictures reality through logical form. What can be said clearly must be said; what cannot must be passed over in silence. It launched logical positivism while pointing beyond itself to ethics and the mystical.',
      },
      {
        title: 'The Social Contract',
        spine: 'Social Contract',
        author: 'Jean-Jacques Rousseau',
        description:
          'Rousseau asks how people can remain free while living under law, answering with the general will and popular sovereignty. He reconceives political legitimacy as a pact that transforms natural liberty into civil freedom. The work inspired democratic revolutions and modern republican thought.',
      },
      {
        title: 'The Gutenberg Galaxy',
        spine: 'Gutenberg Galaxy',
        author: 'Marshall McLuhan',
        description:
          'McLuhan traces how print culture reorganized perception, nationalism, and individuality after the manuscript age. Typography, he argues, produced the “Gutenberg man” whose sensory balance electronic media would again transform. The book coined “the global village” and founded media ecology.',
      },
      {
        title: 'The Idea of the Holy',
        spine: 'Idea of the Holy',
        author: 'Rudolf Otto',
        description:
          'Otto analyzes the holy as a non-rational mysterium tremendum et fascinans—awe mixed with dread and attraction. He distinguishes the numinous from moral and rational religion while showing their relation. The book became a classic of the phenomenology of religious experience.',
      },
      {
        title: 'The Decline of the West, Vol. II',
        spine: 'Decline of West II',
        author: 'Oswald Spengler',
        description:
          'Volume II of Spengler’s morphology of cultures develops the late, “civilizational” phase of Faustian modernity—cities, money, Caesarism, and destiny. He treats cultures as organisms with spring, summer, and winter. Controversial yet influential, it shaped interwar philosophies of history.',
      },
      {
        title: 'The World of Humanism, 1453–1517: The Rise of Modern Europe',
        spine: 'World of Humanism',
        author: 'Myron P. Gilmore',
        description:
          'Gilmore surveys the humanist revival between the fall of Constantinople and the Reformation. Learning, patronage, printing, and classical recovery reshape European culture on the eve of modernity. The volume situates Renaissance humanism within political and religious change.',
      },
      {
        title: 'The American Lyceum',
        spine: 'American Lyceum',
        author: 'Author uncertain',
        description:
          'A study of the nineteenth-century American lyceum movement—public lectures that brought science, literature, and reform to towns across the republic. The lyceum helped invent a democratic culture of adult education and celebrity oratory. Exact edition details for this shelf copy remain uncertain.',
      },
      {
        title: 'Libido Dominandi: Sexual Liberation and Political Control',
        spine: 'Libido Dominandi',
        author: 'E. Michael Jones',
        description:
          'Jones argues that sexual liberation has been enlisted as a tool of social and political control rather than genuine emancipation. Drawing on history, psychology, and Catholic critique, he links erotic culture to power. The book is polemical and belongs to a contested tradition of cultural criticism.',
      },
      {
        title: 'Major Works, Vol. I',
        spine: 'Maistre Vol. I',
        author: 'Joseph de Maistre',
        description:
          'This volume gathers major writings of the Savoyard counter-revolutionary thinker. Maistre defends throne and altar, providence in history, and the limits of rationalist politics after the French Revolution. His style—ironic, severe, vivid—made him a lasting voice of reactionary thought.',
      },
      {
        title: 'The Essential Writings of Christian Mysticism',
        spine: 'Chr. Mysticism',
        author: 'Associated with Bernard McGinn',
        description:
          'An anthology of Christian mystical texts spanning desert fathers, medieval visionaries, and later contemplatives. Selections illuminate union with God, negative theology, and the stages of the spiritual life. McGinn’s association marks the scholarly framing of the Western mystical tradition.',
      },
      {
        title: 'The Earth Has a Soul',
        spine: 'Earth Has a Soul',
        author: 'C. G. Jung, edited by Meredith Sabini',
        description:
          'Sabini gathers Jung’s writings on nature, psyche, and the living world. Jung links ecological crisis to a severed relation between consciousness and the unconscious depths symbolized by earth. The collection speaks to environmental psychology and depth ecology.',
      },
      {
        title: 'The Key to Understand C. G. Jung',
        spine: 'Key to Jung',
        author: 'Benoit Rousseau',
        description:
          'A compact guide to Jung’s core ideas—archetypes, individuation, the shadow, anima and animus, and the collective unconscious. Rousseau aims to open Jung’s dense corpus for newcomers without flattening its symbolic richness. Useful as a map beside Jung’s own major works.',
      },
      {
        title: 'Man and His Symbols',
        spine: 'Man & Symbols',
        author: 'Carl G. Jung',
        description:
          'Jung’s last major project, written for a general audience, explains how symbols mediate between conscious life and the unconscious. Essays by Jung and collaborators treat dreams, myth, and modern art as living symbolic language. It remains the most approachable introduction to analytical psychology.',
      },
      {
        title: 'The Essential Works of Lenin',
        spine: 'Essential Lenin',
        author: 'V. I. Lenin',
        description:
          'A selection of Lenin’s writings on imperialism, the party, state and revolution, and strategy. The texts shaped Bolshevik practice and twentieth-century Marxism-Leninism. Read as history of ideas, they show how theory and organizational power fused in revolutionary politics.',
      },
      {
        title: 'Process and Reality, corrected edition',
        spine: 'Process & Reality',
        author: 'Alfred North Whitehead',
        description:
          'Whitehead’s Gifford Lectures construct a speculative cosmology of actual occasions, prehension, and creative advance. The corrected edition clarifies one of the densest systems in process philosophy. Being is becoming; God and the world are mutually implicated in creativity.',
      },
      {
        title: 'Science and the Modern World',
        spine: 'Science & Modern',
        author: 'Alfred North Whitehead',
        description:
          'Whitehead traces how the scientific worldview emerged from medieval and early modern thought and what it costs the modern mind. He criticizes the “bifurcation of nature” and sketches an organic alternative. Accessible yet deep, it prepares readers for his later metaphysics.',
      },
      {
        title: 'Logos and Life',
        spine: 'Logos and Life',
        author: 'Anna-Teresa Tymieniecka',
        description:
          'Tymieniecka’s phenomenological project centers the creative logos of life as the origin of sense and self. Bridging phenomenology and a philosophy of nature, she rethinks individuality, imagination, and the ontopoiesis of life. The work is a signature contribution of the World Phenomenology Institute tradition.',
      },
      {
        title: 'On Experience, Nature, and Freedom',
        spine: 'Exp. Nature Freedom',
        author: 'John Dewey',
        description:
          'Selections from Dewey’s pragmatism linking experience, naturalism, and democratic freedom. Knowledge is experimental inquiry within nature, not a spectator’s mirror; freedom grows through intelligent habit and social reconstruction. The volume showcases American philosophy’s public, reformist temper.',
      },
      {
        title: 'Knowledge and Experience',
        spine: 'Knowl. & Exp.',
        author: 'Rollins',
        description:
          'A philosophical study of how knowledge arises from and returns to lived experience. The work sits in mid-century debates about empiricism, meaning, and the limits of abstract theory. It rewards readers interested in the texture of knowing rather than formal epistemology alone.',
      },
      {
        title: 'Meta-Meditations',
        spine: 'Meta-Meditations',
        author: 'Sesonske and Fleming',
        description:
          'Essays that take Descartes’ Meditations as a starting point for renewed inquiry into certainty, self, and method. Sesonske and Fleming invite reflection on what it means to meditate philosophically after modern doubt. The collection bridges historical commentary and contemporary problems.',
      },
      {
        title: 'Time and Eternity',
        spine: 'Time & Eternity',
        author: 'Walter Terence Stace',
        description:
          'Stace examines mystical claims about eternity against philosophical accounts of time. He distinguishes temporal succession from the timeless now reported in religious experience and tests their coherence. The book is a careful analytic treatment of mysticism and metaphysics.',
      },
      {
        title: 'Mind: A Brief Introduction',
        spine: 'Mind',
        author: 'John R. Searle',
        description:
          'Searle offers a clear map of the philosophy of mind—consciousness, intentionality, free will, and the critique of strong AI. He defends biological naturalism: mental states are real features of brains, not software or illusions. A compact entry into debates he helped define.',
      },
      {
        title: 'On the Genealogy of Morals',
        spine: 'Genealogy of Morals',
        author: 'Friedrich Nietzsche',
        description:
          'Three essays unmask the origins of moral values in ressentiment, guilt, and the ascetic ideal. Nietzsche asks what the value of values themselves has been for life. The Genealogy remains essential for ethics, psychology, and critique of modernity.',
      },
      {
        title: 'Philosophy of Poetry (The Genius of Lucretius)',
        spine: 'Phil. of Poetry',
        author: 'Henri Bergson',
        description:
          'Bergson reflects on Lucretius and the philosophical work poetry can do—making duration, nature, and thought palpable. Poetry is not ornament on ideas but a mode of intuition. The essay links his vitalism to classical didactic verse.',
      },
      {
        title: 'Holy Bible (American Standard Version, with references)',
        spine: 'Holy Bible ASV',
        author: 'American Standard Version',
        description:
          'The American Standard Version (1901) is a revision in the King James lineage prized for literal accuracy and cross-references. It shaped American Protestant study Bibles in the early twentieth century. On this shelf it stands as scripture and as a monument of English religious prose.',
      },
      {
        title: 'Stalin',
        spine: 'Stalin',
        author: 'Leon Trotsky',
        description:
          'Trotsky’s unfinished biography of Stalin is both indictment and political history of the Soviet bureaucracy. Written in exile, it portrays Stalin’s rise as the triumph of mediocrity and apparatus over revolutionary internationalism. It remains a primary document of the anti-Stalinist left.',
      },
      {
        title: 'Gödel, Escher, Bach',
        spine: 'Gödel, Escher, Bach',
        author: 'Douglas Hofstadter',
        description:
          'Gödel, Escher, Bach: an Eternal Golden Braid is Hofstadter’s Pulitzer Prize–winning fugue on minds and machines—linking Gödel’s incompleteness, Escher’s visual paradoxes, and Bach’s canons to strange loops, consciousness, and formal systems. Playful dialogues and deep technical digressions make it a classic of related thought beside philosophy of mind and logic.',
      },
      {
        title: 'Capitalist Realism: Is There No Alternative?',
        spine: 'Capitalist Realism',
        author: 'Mark Fisher',
        description:
          'Mark Fisher’s Capitalist Realism (Zero Books, 2009) diagnoses the pervasive sense that there is no alternative to capitalism—that it is easier to imagine the end of the world than the end of capitalism. Through film, music, education, bureaucracy, and mental health, it reads that resignation as ideology and looks for the cracks where a different future might show through.',
      },
    ],
  },
  {
    id: 'history',
    label: 'History & Politics',
    category: 'Ancient history, general history, and political thought',
    books: [
      {
        title: 'A History of the Ancient World, second edition',
        spine: 'Anc. World Hist.',
        author: 'Chester G. Starr',
        description:
          'Starr’s survey covers the Near East, Greece, and Rome with attention to institutions, economy, and culture. The second edition refined a durable textbook narrative of antiquity for students. It balances political outline with social and intellectual context.',
      },
      {
        title: 'The Life of Greece',
        spine: 'Life of Greece',
        author: 'Will Durant',
        description:
          'Part of The Story of Civilization, this volume paints Hellenic life from Crete and Homeric legend through Alexander. Durant’s prose celebrates art, philosophy, and civic culture for a broad readership. It remains a warm, panoramic introduction to classical Greece.',
      },
      {
        title: 'The Outline of History',
        spine: 'Outline of Hist.',
        author: 'H. G. Wells',
        description:
          'Wells attempts a single narrative of humanity from deep time through the Great War. Popular science and progressive hope frame empires, religions, and technology as chapters in one human story. The Outline helped invent the modern one-volume world history for general readers.',
      },
      {
        title: 'The Legacy of Israel',
        spine: 'Legacy of Israel',
        author: 'Various contributors',
        description:
          'A collective volume on the enduring contributions of Israel to religion, law, and culture in the West. Essays typically treat Hebrew scripture, prophecy, and historical peoplehood as civilizational inheritance. It belongs to early twentieth-century efforts to map “legacies” of ancient peoples.',
      },
      {
        title: 'Living Biographies of Famous Rulers',
        spine: 'Famous Rulers',
        author: 'Henry Thomas and Dana Lee Thomas',
        description:
          'Living Biographies of Famous Rulers collects dramatic sketches of sovereigns and conquerors from ancient times to the modern age—Solomon and Caesar through Napoleon, Victoria, and beyond. Henry and Dana Lee Thomas write for a general audience seeking memorable character over archival minutiae, with illustrations by Gordon Ross.',
      },
      {
        title: 'Myths of Crete & Pre-Hellenic Europe',
        spine: 'Myths of Crete',
        author: 'Donald A. Mackenzie',
        description:
          'Mackenzie gathers myths and archaeological speculation about Minoan Crete and Europe before classical Greece. Goddess cults, labyrinths, and sea kings populate a romantic reconstruction of pre-Hellenic religion. Valuable as a period window onto early twentieth-century mythography.',
      },
      {
        title: 'A History of the Western World',
        spine: 'Western World',
        author: 'Shepard B. Clough, Nina G. Garsoian, David L. Hicks, Peter Gay, David J. Brandenburg, et al. (Heath)',
        description:
          'A multi-author Heath textbook surveying Western civilization from antiquity to the modern age. Political narrative is paired with cultural and social chapters by specialists including Peter Gay. It exemplifies mid-century American college survey history.',
      },
      {
        title: 'China',
        spine: 'China',
        author: 'Felix Greene',
        description:
          'Greene’s reportage and reflection on China for Western readers during a period of limited access and strong ideology. Observation, politics, and persuasion intertwine in a mid-century portrait of a transforming society. Read both for information and as a document of its moment.',
      },
      {
        title: 'The Oxford Dictionary of Classical Myth and Religion',
        spine: 'Ox. Myth & Rel.',
        author: 'Edited by Simon Price and Emily Kearns',
        description:
          'A reference dictionary of Greek and Roman myth, cult, and religious practice. Entries balance literary myth with archaeological and historical evidence. Essential for students navigating gods, rites, and the religious landscape of classical antiquity.',
      },
      {
        title: 'The Twelve Caesars',
        spine: 'Twelve Caesars',
        author: 'Michael Grant',
        description:
          'Grant retells the lives of Rome’s first twelve emperors in the tradition of Suetonius for modern readers. Character, scandal, and statecraft drive a narrative of the early Principate. A lively bridge between ancient biography and popular Roman history.',
      },
      {
        title: 'The Age of Napoleon',
        spine: 'The Age of Napoleon',
        author: 'Will Durant (with Ariel Durant)',
        description:
          'Volume XI of The Story of Civilization: Will Durant, with Ariel Durant, chronicle Europe from the French Revolution through Napoleon’s fall, weaving politics with culture and manners. Their series style favors readable synthesis over archival debate. This volume captures the Romantic age’s violence and grandeur.',
      },
      {
        title: 'Rethinking the Scientific Revolution',
        spine: 'Sci. Revolution',
        author: 'Edited by Margaret J. Osler',
        description:
          'Essays that revise the classic narrative of a sudden seventeenth-century scientific break. Contributors stress continuity, theology, craft traditions, and local contexts. The collection is a standard entry into historiography of early modern science.',
      },
      {
        title: 'The Romantic Rebellion',
        spine: 'Romantic Rebellion',
        author: 'Kenneth Clark',
        description:
          'Clark’s study of Romantic art as a revolt against neoclassical order—Goya, Blake, Turner, Delacroix, and others. Emotion, nature, and the sublime reshape European visual culture. Drawn from his lectures, it pairs connoisseurship with cultural history.',
      },
      {
        title: 'The Culture of Narcissism: American Life in an Age of Diminishing Expectations',
        spine: 'Culture of Narcissism',
        author: 'Christopher Lasch',
        description:
          'Lasch diagnoses late-twentieth-century America as a therapeutic, consumerist culture of fragile selfhood. Diminished public life and rising private anxiety form a politics of the self. The book became a touchstone for critics of individualism and managed society.',
      },
      {
        title: 'Lafayette Letters',
        spine: 'Lafayette Letters',
        author: 'Edited by Edward Everett Dale',
        description:
          'Selected correspondence of the Marquis de Lafayette, linking the American and French Revolutions. Dale’s edition presents the voice of an aristocratic liberal who fought for both republics. The letters illuminate transatlantic revolutionary networks.',
      },
      {
        title: 'Life of Lincoln',
        spine: 'Life of Lincoln',
        author: 'Farm and Fireside Library, 1896',
        description:
          'A late-nineteenth-century popular biography of Abraham Lincoln issued for home reading. Sentiment, moral lesson, and national myth outweigh modern archival method. As a period piece it shows how Americans remembered Lincoln a generation after the Civil War.',
      },
      {
        title: 'African Game Trails, Vol. IV',
        spine: 'Game Trails IV',
        author: 'Theodore Roosevelt',
        description:
          'Roosevelt’s African safari narrative mixes big-game hunting, natural history, and imperial travel writing. Volume IV continues the expedition’s chronicle of landscape and quarry. The work reveals Progressive-era American masculinity abroad and early conservationist tension.',
      },
      {
        title: 'Alexander: The Ends of the Earth',
        spine: 'Alexander',
        author: 'Valerio Massimo Manfredi',
        description:
          'A historical novel of Alexander the Great pushing to the edges of the known world. Manfredi blends campaign narrative with character drama for a wide readership. It belongs to modern popular retellings of the Macedonian conquest.',
      },
    ],
  },
  {
    id: 'literature',
    label: 'Literature & Poetry',
    category: 'Literature, literary criticism, and poetry',
    books: [
      {
        title: 'The Brothers Karamazov',
        spine: 'Karamazov',
        author: 'Fyodor Dostoevsky',
        description:
          'Dostoevsky’s final novel stages faith, doubt, and patricide among the Karamazov brothers. Ivan’s rebellion, Alyosha’s compassion, and Dmitri’s passion contend over the soul of Russia and the problem of evil. It is a summit of the psychological and theological novel.',
      },
      {
        title: 'The Name of the Rose',
        spine: 'Name of the Rose',
        author: 'Umberto Eco',
        description:
          'A semiotic murder mystery set in a fourteenth-century abbey where books can kill. Eco fuses detective plot with medieval philosophy, heresy, and the comedy of interpretation. The novel made scholastic debate thrilling for a global audience.',
      },
      {
        title: 'Creative Evolution',
        spine: 'Creative Evolution',
        author: 'Henri Bergson',
        description:
          'Bergson proposes élan vital—creative duration—against mechanistic accounts of life. Evolution is invention, not mere rearrangement of the given. Though philosophical, the book’s literary force placed it among modernism’s intellectual touchstones.',
      },
      {
        title: 'Repetition and Philosophical Crumbs',
        spine: 'Repetition',
        author: 'Søren Kierkegaard',
        description:
          'Kierkegaard explores repetition as a category of personal existence distinct from recollection. Paired with Philosophical Crumbs (Fragments), the texts probe faith, paradox, and the moment of decision. They are compact gateways into his pseudonymous authorship.',
      },
      {
        title: 'Concluding Unscientific Postscript',
        spine: 'Unsci. Postscript',
        author: 'Søren Kierkegaard (tr. Howard V. Hong and Edna H. Hong)',
        description:
          'Climacus’s postscript insists that truth is subjectivity and that the existing individual cannot be absorbed into a system. Against Hegelian speculation, faith remains a passionate inward appropriation. The Hong translation is a standard for Anglophone Kierkegaard studies.',
      },
      {
        title: 'The Rebel',
        spine: 'The Rebel',
        author: 'Albert Camus',
        description:
          'Camus examines metaphysical and historical rebellion from the Romantics to modern revolutions. He asks how revolt against injustice becomes nihilism and murder. The essay articulates a measure—limits—against absolute ideologies.',
      },
      {
        title: 'Three Complete Novels',
        spine: 'Hawthorne Novels',
        author: 'Nathaniel Hawthorne',
        description:
          'A collected volume of Hawthorne’s major fiction—romances of sin, guilt, and New England conscience. Allegory and psychological shadow mark his Puritan inheritance. The omnibus suits readers wanting his novelistic work in one binding.',
      },
      {
        title: 'The Complete Poetry and Prose of William Blake',
        spine: 'Blake Complete',
        author: 'William Blake',
        description:
          'Blake’s illuminated poetry and prophetic books in a comprehensive reading text. Songs of Innocence and Experience sit beside The Marriage of Heaven and Hell and the later epics. Essential for the visionary who fused word and image.',
      },
      {
        title: 'The Essential Goethe',
        spine: 'Essential Goethe',
        author: 'Johann Wolfgang von Goethe',
        description:
          'A curated selection from Goethe’s vast oeuvre—lyric, drama, fiction, and science. Faustian striving and classical form meet in the central figure of German letters. The volume offers a portable map of his range.',
      },
      {
        title: 'Fearful Symmetry: A Study of William Blake',
        spine: 'Fearful Symmetry',
        author: 'Northrop Frye',
        description:
          'Frye’s breakthrough reading of Blake as a coherent mythological system rather than mad fragments. Typology and imagination unlock the prophecies. The book established Frye and remade Blake criticism.',
      },
      {
        title: 'The Secular Scripture',
        spine: 'Secular Scripture',
        author: 'Northrop Frye',
        description:
          'Frye treats romance as the secular counterpart to sacred narrative—structure shared across popular and high forms. Quest, descent, and recognition patterns organize storytelling itself. A late statement of his archetypal criticism.',
      },
      {
        title: 'The Hero with a Thousand Faces',
        spine: 'Hero 1000 Faces',
        author: 'Joseph Campbell',
        description:
          'Campbell’s monomyth traces the hero’s journey—departure, initiation, return—across world mythologies. Jungian and comparative method yield a template that influenced writers and filmmakers. Contested by specialists, it remains culturally ubiquitous.',
      },
      {
        title: 'Music, Love, Death and Mann’s Doctor Faustus',
        spine: 'Mann’s Faustus',
        author: 'Fetzer',
        description:
          'A critical study of Thomas Mann’s Doctor Faustus through music, eros, and mortality. Fetzer unpacks how the novel allegorizes German culture’s pact with demonic creativity. Useful alongside Mann’s own late masterpiece.',
      },
      {
        title: 'Poems of Byron, Vol. II',
        spine: 'Byron Poems II',
        author: 'Lord Byron',
        description:
          'The second volume of Byron’s poetry—wit, satire, and Romantic swagger in verse. From oriental tales to later lyrics, the Byronic voice dramatizes exile and desire. Nineteenth-century collected editions made him a shelf staple.',
      },
      {
        title: 'The Complete Poems of Cavafy',
        spine: 'Cavafy Poems',
        author: 'C. P. Cavafy (tr. Rae Dalven)',
        description:
          'Cavafy’s Alexandrian poems of history, desire, and ironic retrospect in Dalven’s English. Hellenistic kings and modern longing share the same rueful light. He is a master of the brief, unforgettable lyric.',
      },
      {
        title: 'Poets on Poetry',
        spine: 'Poets on Poetry',
        author: 'Edited by Norman',
        description:
          'An anthology of poets reflecting on craft, tradition, and the art of verse. Practitioners describe how poems are made and why they matter. The collection bridges criticism and workshop insight.',
      },
      {
        title: 'One Hundred and One Famous Poems',
        spine: '101 Famous Poems',
        author: 'Anthology',
        description:
          'A popular American anthology of widely memorized poems from the English canon and beyond. Designed for home and school, it fixed a shared repertoire of “famous” verse. Sentiment and oratory sit beside quieter lyrics.',
      },
      {
        title: 'Disenchanted Images',
        spine: 'Disenchanted Images',
        author: 'Zolotow',
        description:
          'A literary work concerned with disenchanted images and the reassembly of meaning in modern writing. Zolotow’s title signals critique of representation and memory. It belongs with mid-to-late century experiments in poetic and critical prose.',
      },
      {
        title: 'Modern American Criticism',
        spine: 'Mod. Am. Crit.',
        author: 'Anthology / survey',
        description:
          'A survey or collection of twentieth-century American critical voices—New Criticism, myth study, and later schools. It charts how the United States professionalized literary interpretation. Useful as a period map of critical method.',
      },
      {
        title: 'John Milton: Englishman',
        spine: 'Milton Englishman',
        author: 'James Holly Hanford',
        description:
          'Hanford’s study places Milton in English political and religious life as much as in poetic tradition. Biography and criticism intertwine around the poet of Paradise Lost. A classic mid-century Miltonist portrait.',
      },
      {
        title: 'Selected Essays of William Hazlitt',
        spine: 'Hazlitt Essays',
        author: 'William Hazlitt',
        description:
          'Hazlitt’s essays on literature, art, and character display Romantic prose at its most vivid and combative. Familiar style and fierce judgment make him a model of personal criticism. The selection gathers his most enduring pieces.',
      },
      {
        title: 'The Poetical Works of John Milton, Vol. II (London, 1808)',
        spine: 'Milton 1808 II',
        author: 'John Milton',
        description:
          'An early nineteenth-century London printing of Milton’s poetry, Volume II. Such editions carried Paradise Regained, Samson Agonistes, and shorter poems to Romantic-era readers. The physical book is itself a historical artifact of Milton’s afterlife.',
      },
      {
        title: 'The Dramatic Works of William Shakespeare, Vol. II (Hartford, 1832)',
        spine: 'Shakespeare 1832',
        author: 'William Shakespeare',
        description:
          'A Hartford 1832 volume from an American collected Shakespeare. Nineteenth-century printings spread the plays through schools and parlors of the early republic. Volume II continues the dramatic works in period typography.',
      },
      {
        title: 'The Divine Comedy',
        spine: 'Divine Comedy',
        author: 'Dante Alighieri',
        description:
          'Dante’s journey through Inferno, Purgatorio, and Paradiso—the great medieval epic of soul and cosmos. Personal exile meets scholastic theology and vernacular genius. It remains the central poem of the Italian tradition and Christian imagination.',
      },
      {
        title: 'Paradise Lost',
        spine: 'Paradise Lost',
        author: 'John Milton',
        description:
          'Milton’s blank-verse epic of the Fall—“to justify the ways of God to men.” Satan’s rhetoric, Adam and Eve’s drama, and cosmic war redefine English heroic poetry. It is the summit of seventeenth-century literary ambition.',
      },
      {
        title: 'Great Expectations',
        spine: 'Great Expectations',
        author: 'Charles Dickens',
        description:
          'Pip’s rise and reckoning in a novel of class, guilt, and false gentility. Dickens joins mystery plot to moral education and unforgettable characters. Among his most tightly wrought and beloved books.',
      },
      {
        title: 'Babbitt',
        spine: 'Babbitt',
        author: 'Sinclair Lewis',
        description:
          'Lewis satirizes Midwestern booster culture through George F. Babbitt, realtor and conformist. The novel named an American type—the hollow prosperity of the 1920s. It helped win Lewis the Nobel Prize in Literature.',
      },
      {
        title: 'Light in August',
        spine: 'Light in August',
        author: 'William Faulkner',
        description:
          'Faulkner’s Yoknapatawpha novel of race, identity, and violence in the Jim Crow South. Joe Christmas, Lena Grove, and Gail Hightower intersect in a tragic, modernist structure. It is among his most powerful and accessible major works.',
      },
      {
        title: 'The American Romantics, 1800–1860 (American Literature Survey)',
        spine: 'Am. Romantics',
        author: 'American Literature Survey (revised edition)',
        description:
          'A survey anthology of American Romantic writing from roughly 1800 to 1860. Emerson, Hawthorne, Melville, Whitman, and their contemporaries define a national literary awakening. The revised edition expands the classroom canon of the period.',
      },
      {
        title: 'Milton and the Sons of God',
        spine: 'Milton Sons of God',
        author: 'MacCallum',
        description:
          'A critical study of Milton’s treatment of divine sonship, angels, and humanity’s relation to God. MacCallum reads theology and poetics together in the major poems. Specialized Milton scholarship for readers past the introductory stage.',
      },
      {
        title: 'The Dyer’s Hand',
        spine: 'Dyer’s Hand',
        author: 'W. H. Auden',
        description:
          'Auden’s essays on poetry, Shakespeare, and the vocation of the writer. Informal yet exacting, they show a major poet thinking in public. The title volume is a cornerstone of twentieth-century literary prose.',
      },
      {
        title: 'From Proust to Camus',
        spine: 'Proust to Camus',
        author: 'André Maurois',
        description:
          'Maurois surveys modern French literature from Proust’s memory-world to Camus’s absurd. Biographical warmth and critical clarity introduce key figures to a broad audience. A bridge between belletristic portrait and literary history.',
      },
      {
        title: 'Mark Twain’s Wound: A Casebook',
        spine: 'Twain’s Wound',
        author: 'Edited by Lewis Leary',
        description:
          'A casebook gathering criticism around psychological and biographical readings of Mark Twain. “Wound” names the private hurt behind the public humorist. Leary’s collection maps mid-century approaches to Twain’s darker side.',
      },
      {
        title: 'Great American Prose Poems',
        spine: 'Am. Prose Poems',
        author: 'Edited by David Lehman',
        description:
          'Lehman’s anthology showcases the American prose poem from early experiments to contemporary practice. The form blurs verse and paragraph without losing poetic intensity. A defining gathering for readers of the genre.',
      },
      {
        title: 'Contemporary American Poetry',
        spine: 'Contemp. Am. Poetry',
        author: 'Edited by A. Poulin Jr.',
        description:
          'Poulin’s widely used anthology of later twentieth-century American poets. Diverse schools—confessional, deep image, New York, and more—share one teaching volume. It shaped a generation’s classroom sense of “contemporary” verse.',
      },
      {
        title: 'Thirty-Eight Latin Stories',
        spine: '38 Latin Stories',
        author: 'Anne H. Groton and James M. May',
        description:
          'Graded Latin readings designed to accompany Wheelock and similar grammars. Myth and history supply short narratives for building fluency. A practical classroom classic for beginning Latinists.',
      },
      {
        title: 'Shakespeare’s Language',
        spine: 'Shakes. Language',
        author: 'Frank Kermode',
        description:
          'Kermode listens closely to how Shakespeare’s words work—rhetoric, ambiguity, and dramatic speech. Criticism here is an art of attention rather than theory-first method. A late master’s guide to reading the plays as language.',
      },
      {
        title: 'Mason & Dixon',
        spine: 'Mason & Dixon',
        author: 'Thomas Pynchon',
        description:
          'Pynchon’s epic picaresque of the surveyors who drew America’s famous line. Eighteenth-century pastiche meets paranoia, comedy, and colonial history. Among his warmest and most expansive novels.',
      },
      {
        title: 'Shakespeare’s Sonnets',
        spine: 'Sonnets',
        author: 'William Shakespeare',
        description:
          'The 154 sonnets on love, time, beauty, and betrayal—the young man, the dark lady, and the rival poet. Dense wordplay rewards endless rereading. They stand with the plays as Shakespeare’s other monument.',
      },
      {
        title: 'Shakespeare Studies: Macbeth',
        spine: 'Macbeth Studies',
        author: 'Charlotte Porter and Helen A. Clarke (American Book Company)',
        description:
          'An early American educational edition devoted to Macbeth with notes and study apparatus. Porter and Clarke helped school readers through Shakespeare’s language and themes. A period artifact of classroom Shakespeare.',
      },
      {
        title: 'Hamann’s Poetical Works / Schriften',
        spine: 'Hamann Schriften',
        author: 'J. G. Hamann',
        description:
          'Writings of the “Magus of the North,” whose fragmentary, scriptural style challenged Enlightenment rationalism. Poetry and theology intertwine in a highly allusive German prose. Hamann influenced Herder, Kierkegaard, and later critics of pure reason.',
      },
      {
        title: 'Gulliver’s Travels',
        spine: 'Gulliver',
        author: 'Jonathan Swift',
        description:
          'Swift’s satirical voyages to Lilliput, Brobdingnag, Laputa, and the land of the Houyhnhnms. Travel narrative becomes a scalpel on politics, science, and human pride. A foundational work of English satire.',
      },
      {
        title: 'Doktor Faustus',
        spine: 'Doktor Faustus',
        author: 'Thomas Mann',
        description:
          'Thomas Mann’s Doktor Faustus (Doctor Faustus): the life of composer Adrian Leverkühn and a demonic pact that allegorizes modern German culture. Music, theology, and history converge in a tragic twentieth-century Faust—Mann’s late masterpiece of art and damnation, distinct from critical studies of the novel.',
      },
      {
        title: 'Autobiography of Bertrand Russell',
        spine: 'Russell Autobiog.',
        author: 'Bertrand Russell',
        description:
          'Russell’s memoirs of childhood, logic, pacifism, love, and public fame. The philosopher of mathematics appears as a witty, conflicted modern life. Essential for the person behind Principia and the activism.',
      },
      {
        title: 'George Herbert',
        spine: 'George Herbert',
        author: 'Stanley Stewart',
        description:
          'A critical study of the Metaphysical poet of The Temple. Stewart situates Herbert’s sacred lyrics in devotion, form, and seventeenth-century context. Helpful for readers moving from anthology pieces to deeper engagement.',
      },
      {
        title: 'Representative Man: Ralph Waldo Emerson in His Time',
        spine: 'Representative Man',
        author: 'Joel Porte',
        description:
          'Joel Porte’s 1979 study of Emerson (Oxford University Press) reads the life through the work: the journals, lectures, and essays traced from the young minister to the Concord sage. Porte attends to Emerson’s language, doubts, and public role, presenting a living writer rather than a marble monument. A classic of Emerson scholarship that borrows its title from Emerson’s own Representative Men.',
      },
      {
        title: 'Euripides III',
        spine: 'Euripides III',
        author: 'Euripides (ed. David Grene and Richmond Lattimore)',
        description:
          'Euripides III in The Complete Greek Tragedies (University of Chicago / Grene & Lattimore) gathers modern verse translations of later Euripidean dramas—Hecuba, Andromache, The Trojan Women, and Ion in the classic paperback sequence. A standard classroom and shelf companion for Greek tragedy in English.',
      },
      {
        title: 'The New Pocket Anthology of American Verse',
        spine: 'American Verse',
        author: 'Edited by Oscar Williams',
        description:
          'Oscar Williams’s New Pocket Anthology of American Verse surveys American poetry from colonial days to the mid-twentieth century in a mass-market Washington Square / Pocket Books format. Dickinson, Whitman, Poe, Frost, and their heirs sit in a portable classroom classic.',
      },
      {
        title: 'James Joyce',
        spine: 'James Joyce',
        author: 'Richard Ellmann',
        description:
          'Richard Ellmann’s James Joyce is the landmark Oxford biography of the Irish modernist—from Dublin and Trieste through Ulysses and Finnegans Wake. Documentary richness and critical tact made it the standard life for generations of Joyce readers.',
      },
      {
        title: 'Oscar Wilde',
        spine: 'Oscar Wilde',
        author: 'Hesketh Pearson',
        description:
          'Hesketh Pearson’s biography of Oscar Wilde (often titled The Life of Oscar Wilde) recounts the wit, success, trial, and exile of the Victorian aesthete. A readable mid-century life that helped keep Wilde’s legend in popular circulation.',
      },
      {
        title: 'Wheelock’s Latin',
        spine: 'Wheelock’s Latin',
        author: 'Frederic M. Wheelock',
        description:
          'Wheelock’s Latin is the long-standard introductory Latin grammar and reader for American students—morphology, syntax, and graded sentences toward classical authors. A practical companion beside other Latin readers on this shelf.',
      },
      {
        title: 'Reminiscences',
        spine: 'Reminiscences',
        author: 'Thomas Carlyle',
        description:
          'Thomas Carlyle’s Reminiscences collect autobiographical sketches and memorial portraits—above all of Jane Welsh Carlyle and circle figures—edited after his death. Classic Victorian reminiscence: intimate, opinionated, and a primary document of Carlyle’s world.',
      },
      {
        title: 'Whatever Is Moving',
        spine: 'Whatever Is Moving',
        author: 'Howard Moss',
        description:
          'Howard Moss’s Whatever Is Moving (Little, Brown, 1981) gathers essays by the longtime poetry editor of The New Yorker—on poets, poems, and the moving life of literary attention. A late-century critic’s prose from a major New York house.',
      },
      {
        title: 'Infinite Jest',
        spine: 'Infinite Jest',
        author: 'David Foster Wallace',
        description:
          'David Foster Wallace’s Infinite Jest is a vast comic-tragic novel of addiction, entertainment, tennis academies, and Quebecois separatism in a near-future North America. Encyclopedic, footnote-laden, and emotionally fierce, it became the defining late-twentieth-century maximalist American novel.',
      },
    ],
  },
  {
    id: 'essays',
    label: 'Essays & Older Editions',
    category: 'American and British essays, older editions, and historical literature',
    books: [
      {
        title: 'Essays and Lectures',
        spine: 'Emerson Essays',
        author: 'Ralph Waldo Emerson (Library of America)',
        description:
          'Library of America’s Emerson: Essays and Lectures collects Nature; Addresses, and Lectures; Essays: First and Second Series; Representative Men; English Traits; and The Conduct of Life. The omnibus gathers Emerson’s central public prose—from Nature and the American Scholar through Self-Reliance and the later conduct essays—in one Transcendentalist volume. Kept beside any standalone Representative Men copy as the LOA Essays and Lectures edition.',
      },
      {
        title: 'Fireside Travels',
        spine: 'Fireside Travels',
        author: 'James Russell Lowell',
        description:
          'Lowell’s travel sketches and reflective prose for the fireside reader. European impressions mix with the essayist’s genial learning. A window onto mid-nineteenth-century American letters abroad.',
      },
      {
        title: 'Political Essays',
        spine: 'Political Essays',
        author: 'James Russell Lowell',
        description:
          'Lowell on politics, war, and civic conscience—including Civil War–era concerns. The Brahmin poet appears as public moralist and satirist. The essays document New England liberal opinion in formation.',
      },
      {
        title: 'My Study Windows',
        spine: 'Study Windows',
        author: 'James Russell Lowell',
        description:
          'Familiar essays looking out from the scholar’s study onto literature and nature. Lowell’s conversational learning epitomizes the nineteenth-century man of letters. The title became synonymous with civilized periodical prose.',
      },
      {
        title: 'Among My Books',
        spine: 'Among My Books',
        author: 'James Russell Lowell',
        description:
          'Critical essays on Dante, Chaucer, Spenser, Wordsworth, and others. Lowell reads as a poet-critic with historical sympathy and style. A companion volume to his other essay collections on this shelf.',
      },
      {
        title: 'Essays, Moral, Economical, and Political',
        spine: 'Bacon Essays 1833',
        author: 'Francis Bacon (Boston, 1833)',
        description:
          'Bacon’s classic essays in a Boston 1833 printing—compact counsel on truth, revenge, studies, and power. Aphoristic Renaissance prose for the early American bookshelf. The edition marks the transatlantic life of a Tudor master.',
      },
      {
        title: 'Napoleon the Little',
        spine: 'Napoleon the Little',
        author: 'Victor Hugo (London, 1882)',
        description:
          'Hugo’s fierce pamphlet against Louis-Napoléon Bonaparte after the 1851 coup. Satire and moral outrage brand the nephew a diminished tyrant. The 1882 London edition keeps exile’s anger in English circulation.',
      },
      {
        title: 'Daniel Boone, and the Hunters of Kentucky',
        spine: 'Daniel Boone 1854',
        author: 'W. H. Bogart (1854)',
        description:
          'A mid-nineteenth-century popular life of Boone and the Kentucky frontier hunters. Legend and narrative history blur in the making of an American pioneer myth. The 1854 date situates it in antebellum frontier literature.',
      },
      {
        title: 'Lives of the Caesars',
        spine: 'Lives of the Caesars',
        author: 'Suetonius',
        description:
          'Suetonius’s De vita Caesarum—also known as The Twelve Caesars—portraits of Rome’s rulers from Julius Caesar through Domitian. Gossip, character, and imperial habit sit beside public deeds in the foundational Latin imperial biographies. Distinct from modern retellings; this is the ancient source itself.',
      },
      {
        title: 'The Iliad',
        spine: 'The Iliad',
        author: 'Homer',
        description:
          'Homer’s epic of the wrath of Achilles before Troy—honor, friendship, and the cost of war. Gods and mortals share a Bronze Age stage of glory and grief. The foundational poem of the Western literary tradition.',
      },
      {
        title: 'Warren French’s biography of John Steinbeck',
        spine: 'Steinbeck Bio',
        author: 'Warren French',
        description:
          'Warren French’s biographical study of John Steinbeck, author of The Grapes of Wrath and Of Mice and Men. It traces the California writer’s career, politics, and craft. A secondary source for readers of Steinbeck’s fiction and life.',
      },
    ],
  },
];

export function countBooks() {
  return shelves.reduce((n, s) => n + s.books.length, 0);
}
