import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = resolve(ROOT, 'src/data/product-images.json')
const LIMIT = Number(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] ?? 300)
const CONCURRENCY = 2
const USER_AGENT = 'CeasaCopacabanaCatalogImporter/0.2 (catalog image research; contact: project maintainer)'

const queries = [
  {
    "department": "mercearia",
    "term": "arroz branco"
  },
  {
    "department": "mercearia",
    "term": "arroz parboilizado"
  },
  {
    "department": "mercearia",
    "term": "arroz integral"
  },
  {
    "department": "mercearia",
    "term": "feijão carioca"
  },
  {
    "department": "mercearia",
    "term": "feijão preto"
  },
  {
    "department": "mercearia",
    "term": "feijão fradinho"
  },
  {
    "department": "mercearia",
    "term": "lentilha"
  },
  {
    "department": "mercearia",
    "term": "ervilha seca"
  },
  {
    "department": "mercearia",
    "term": "grão de bico"
  },
  {
    "department": "mercearia",
    "term": "macarrão espaguete"
  },
  {
    "department": "mercearia",
    "term": "macarrão parafuso"
  },
  {
    "department": "mercearia",
    "term": "macarrão penne"
  },
  {
    "department": "mercearia",
    "term": "macarrão instantâneo"
  },
  {
    "department": "mercearia",
    "term": "farinha de trigo"
  },
  {
    "department": "mercearia",
    "term": "farinha de mandioca"
  },
  {
    "department": "mercearia",
    "term": "fubá"
  },
  {
    "department": "mercearia",
    "term": "milho para pipoca"
  },
  {
    "department": "mercearia",
    "term": "amido de milho"
  },
  {
    "department": "mercearia",
    "term": "polvilho doce"
  },
  {
    "department": "mercearia",
    "term": "polvilho azedo"
  },
  {
    "department": "mercearia",
    "term": "açúcar refinado"
  },
  {
    "department": "mercearia",
    "term": "açúcar cristal"
  },
  {
    "department": "mercearia",
    "term": "açúcar mascavo"
  },
  {
    "department": "mercearia",
    "term": "sal refinado"
  },
  {
    "department": "mercearia",
    "term": "sal grosso"
  },
  {
    "department": "mercearia",
    "term": "café torrado moído"
  },
  {
    "department": "mercearia",
    "term": "café solúvel"
  },
  {
    "department": "mercearia",
    "term": "achocolatado em pó"
  },
  {
    "department": "mercearia",
    "term": "cacau em pó"
  },
  {
    "department": "mercearia",
    "term": "leite em pó"
  },
  {
    "department": "mercearia",
    "term": "óleo de soja"
  },
  {
    "department": "mercearia",
    "term": "azeite de oliva"
  },
  {
    "department": "mercearia",
    "term": "vinagre de álcool"
  },
  {
    "department": "mercearia",
    "term": "vinagre de maçã"
  },
  {
    "department": "mercearia",
    "term": "maionese"
  },
  {
    "department": "mercearia",
    "term": "ketchup"
  },
  {
    "department": "mercearia",
    "term": "mostarda"
  },
  {
    "department": "mercearia",
    "term": "molho de tomate"
  },
  {
    "department": "mercearia",
    "term": "extrato de tomate"
  },
  {
    "department": "mercearia",
    "term": "polpa de tomate"
  },
  {
    "department": "mercearia",
    "term": "molho pesto"
  },
  {
    "department": "mercearia",
    "term": "molho shoyu"
  },
  {
    "department": "mercearia",
    "term": "molho inglês"
  },
  {
    "department": "mercearia",
    "term": "caldo de galinha"
  },
  {
    "department": "mercearia",
    "term": "caldo de carne"
  },
  {
    "department": "mercearia",
    "term": "tempero pronto"
  },
  {
    "department": "mercearia",
    "term": "colorau"
  },
  {
    "department": "mercearia",
    "term": "páprica"
  },
  {
    "department": "mercearia",
    "term": "orégano"
  },
  {
    "department": "mercearia",
    "term": "canela em pó"
  },
  {
    "department": "mercearia",
    "term": "pimenta do reino"
  },
  {
    "department": "mercearia",
    "term": "gelatina"
  },
  {
    "department": "mercearia",
    "term": "mistura para bolo"
  },
  {
    "department": "mercearia",
    "term": "fermento químico"
  },
  {
    "department": "mercearia",
    "term": "fermento biológico"
  },
  {
    "department": "mercearia",
    "term": "aveia em flocos"
  },
  {
    "department": "mercearia",
    "term": "granola"
  },
  {
    "department": "mercearia",
    "term": "cereal matinal"
  },
  {
    "department": "mercearia",
    "term": "biscoito cream cracker"
  },
  {
    "department": "mercearia",
    "term": "biscoito maisena"
  },
  {
    "department": "mercearia",
    "term": "biscoito recheado"
  },
  {
    "department": "mercearia",
    "term": "wafer"
  },
  {
    "department": "mercearia",
    "term": "torrada"
  },
  {
    "department": "mercearia",
    "term": "barra de cereal"
  },
  {
    "department": "mercearia",
    "term": "doce de leite"
  },
  {
    "department": "mercearia",
    "term": "geleia de frutas"
  },
  {
    "department": "mercearia",
    "term": "mel"
  },
  {
    "department": "mercearia",
    "term": "creme de avelã"
  },
  {
    "department": "enlatados",
    "term": "milho verde em conserva"
  },
  {
    "department": "enlatados",
    "term": "ervilha em conserva"
  },
  {
    "department": "enlatados",
    "term": "seleta de legumes"
  },
  {
    "department": "enlatados",
    "term": "sardinha em lata"
  },
  {
    "department": "enlatados",
    "term": "atum em lata"
  },
  {
    "department": "enlatados",
    "term": "molho de tomate em lata"
  },
  {
    "department": "enlatados",
    "term": "tomate pelado"
  },
  {
    "department": "enlatados",
    "term": "azeitona verde"
  },
  {
    "department": "enlatados",
    "term": "azeitona preta"
  },
  {
    "department": "enlatados",
    "term": "palmito em conserva"
  },
  {
    "department": "enlatados",
    "term": "champignon em conserva"
  },
  {
    "department": "enlatados",
    "term": "pepino em conserva"
  },
  {
    "department": "enlatados",
    "term": "picles"
  },
  {
    "department": "enlatados",
    "term": "grão de bico em conserva"
  },
  {
    "department": "enlatados",
    "term": "feijão em conserva"
  },
  {
    "department": "enlatados",
    "term": "cogumelos em conserva"
  },
  {
    "department": "enlatados",
    "term": "leite de coco"
  },
  {
    "department": "enlatados",
    "term": "creme de leite"
  },
  {
    "department": "enlatados",
    "term": "leite condensado"
  },
  {
    "department": "enlatados",
    "term": "coco ralado"
  },
  {
    "department": "enlatados",
    "term": "salsicha em conserva"
  },
  {
    "department": "enlatados",
    "term": "patê de atum"
  },
  {
    "department": "enlatados",
    "term": "patê de sardinha"
  },
  {
    "department": "enlatados",
    "term": "anchova em conserva"
  },
  {
    "department": "carnes",
    "term": "carne bovina acém"
  },
  {
    "department": "carnes",
    "term": "carne bovina alcatra"
  },
  {
    "department": "carnes",
    "term": "carne bovina patinho"
  },
  {
    "department": "carnes",
    "term": "carne bovina músculo"
  },
  {
    "department": "carnes",
    "term": "carne bovina contrafilé"
  },
  {
    "department": "carnes",
    "term": "carne bovina picanha"
  },
  {
    "department": "carnes",
    "term": "carne bovina maminha"
  },
  {
    "department": "carnes",
    "term": "carne bovina fraldinha"
  },
  {
    "department": "carnes",
    "term": "carne bovina costela"
  },
  {
    "department": "carnes",
    "term": "carne moída bovina"
  },
  {
    "department": "carnes",
    "term": "bife bovino"
  },
  {
    "department": "carnes",
    "term": "fígado bovino"
  },
  {
    "department": "carnes",
    "term": "linguiça toscana"
  },
  {
    "department": "carnes",
    "term": "linguiça calabresa"
  },
  {
    "department": "carnes",
    "term": "linguiça de frango"
  },
  {
    "department": "carnes",
    "term": "carne suína pernil"
  },
  {
    "department": "carnes",
    "term": "lombo suíno"
  },
  {
    "department": "carnes",
    "term": "costelinha suína"
  },
  {
    "department": "carnes",
    "term": "bisteca suína"
  },
  {
    "department": "carnes",
    "term": "bacon"
  },
  {
    "department": "carnes",
    "term": "presunto"
  },
  {
    "department": "carnes",
    "term": "mortadela"
  },
  {
    "department": "carnes",
    "term": "salame"
  },
  {
    "department": "carnes",
    "term": "peito de peru"
  },
  {
    "department": "carnes",
    "term": "hambúrguer bovino"
  },
  {
    "department": "carnes",
    "term": "nuggets de frango"
  },
  {
    "department": "carnes",
    "term": "almôndega congelada"
  },
  {
    "department": "carnes",
    "term": "carne seca"
  },
  {
    "department": "carnes",
    "term": "charque"
  },
  {
    "department": "aves_peixes",
    "term": "peito de frango"
  },
  {
    "department": "aves_peixes",
    "term": "coxa de frango"
  },
  {
    "department": "aves_peixes",
    "term": "sobrecoxa de frango"
  },
  {
    "department": "aves_peixes",
    "term": "asa de frango"
  },
  {
    "department": "aves_peixes",
    "term": "frango inteiro"
  },
  {
    "department": "aves_peixes",
    "term": "filé de frango"
  },
  {
    "department": "aves_peixes",
    "term": "frango empanado"
  },
  {
    "department": "aves_peixes",
    "term": "ovos brancos"
  },
  {
    "department": "aves_peixes",
    "term": "ovos vermelhos"
  },
  {
    "department": "aves_peixes",
    "term": "ovo de codorna"
  },
  {
    "department": "aves_peixes",
    "term": "filé de tilápia"
  },
  {
    "department": "aves_peixes",
    "term": "sardinha fresca"
  },
  {
    "department": "aves_peixes",
    "term": "merluza"
  },
  {
    "department": "aves_peixes",
    "term": "pescada"
  },
  {
    "department": "aves_peixes",
    "term": "salmão"
  },
  {
    "department": "aves_peixes",
    "term": "bacalhau"
  },
  {
    "department": "aves_peixes",
    "term": "camarão"
  },
  {
    "department": "aves_peixes",
    "term": "lula"
  },
  {
    "department": "aves_peixes",
    "term": "polvo"
  },
  {
    "department": "aves_peixes",
    "term": "mexilhão"
  },
  {
    "department": "laticinios",
    "term": "leite integral"
  },
  {
    "department": "laticinios",
    "term": "leite semidesnatado"
  },
  {
    "department": "laticinios",
    "term": "leite desnatado"
  },
  {
    "department": "laticinios",
    "term": "leite sem lactose"
  },
  {
    "department": "laticinios",
    "term": "bebida láctea"
  },
  {
    "department": "laticinios",
    "term": "iogurte natural"
  },
  {
    "department": "laticinios",
    "term": "iogurte grego"
  },
  {
    "department": "laticinios",
    "term": "iogurte de morango"
  },
  {
    "department": "laticinios",
    "term": "coalhada"
  },
  {
    "department": "laticinios",
    "term": "requeijão"
  },
  {
    "department": "laticinios",
    "term": "cream cheese"
  },
  {
    "department": "laticinios",
    "term": "queijo muçarela"
  },
  {
    "department": "laticinios",
    "term": "queijo prato"
  },
  {
    "department": "laticinios",
    "term": "queijo minas"
  },
  {
    "department": "laticinios",
    "term": "queijo parmesão"
  },
  {
    "department": "laticinios",
    "term": "queijo coalho"
  },
  {
    "department": "laticinios",
    "term": "queijo cottage"
  },
  {
    "department": "laticinios",
    "term": "manteiga com sal"
  },
  {
    "department": "laticinios",
    "term": "manteiga sem sal"
  },
  {
    "department": "laticinios",
    "term": "margarina"
  },
  {
    "department": "laticinios",
    "term": "creme vegetal"
  },
  {
    "department": "laticinios",
    "term": "nata"
  },
  {
    "department": "laticinios",
    "term": "chantilly"
  },
  {
    "department": "padaria",
    "term": "pão francês"
  },
  {
    "department": "padaria",
    "term": "pão de forma"
  },
  {
    "department": "padaria",
    "term": "pão integral"
  },
  {
    "department": "padaria",
    "term": "pão de hot dog"
  },
  {
    "department": "padaria",
    "term": "pão de hambúrguer"
  },
  {
    "department": "padaria",
    "term": "pão sírio"
  },
  {
    "department": "padaria",
    "term": "pão de queijo"
  },
  {
    "department": "padaria",
    "term": "bisnaguinha"
  },
  {
    "department": "padaria",
    "term": "croissant"
  },
  {
    "department": "padaria",
    "term": "bolo de chocolate"
  },
  {
    "department": "padaria",
    "term": "bolo de cenoura"
  },
  {
    "department": "padaria",
    "term": "bolo de laranja"
  },
  {
    "department": "padaria",
    "term": "panetone"
  },
  {
    "department": "padaria",
    "term": "sonho"
  },
  {
    "department": "padaria",
    "term": "rosquinha"
  },
  {
    "department": "padaria",
    "term": "biscoito amanteigado"
  },
  {
    "department": "padaria",
    "term": "cookie"
  },
  {
    "department": "padaria",
    "term": "brownie"
  },
  {
    "department": "padaria",
    "term": "waffle"
  },
  {
    "department": "padaria",
    "term": "massa de pastel"
  },
  {
    "department": "padaria",
    "term": "massa de pizza"
  },
  {
    "department": "bebidas",
    "term": "água mineral"
  },
  {
    "department": "bebidas",
    "term": "água com gás"
  },
  {
    "department": "bebidas",
    "term": "refrigerante cola"
  },
  {
    "department": "bebidas",
    "term": "refrigerante guaraná"
  },
  {
    "department": "bebidas",
    "term": "refrigerante laranja"
  },
  {
    "department": "bebidas",
    "term": "suco de laranja"
  },
  {
    "department": "bebidas",
    "term": "suco de uva"
  },
  {
    "department": "bebidas",
    "term": "suco de maçã"
  },
  {
    "department": "bebidas",
    "term": "néctar de pêssego"
  },
  {
    "department": "bebidas",
    "term": "água de coco"
  },
  {
    "department": "bebidas",
    "term": "chá mate"
  },
  {
    "department": "bebidas",
    "term": "chá gelado"
  },
  {
    "department": "bebidas",
    "term": "bebida isotônica"
  },
  {
    "department": "bebidas",
    "term": "energético"
  },
  {
    "department": "bebidas",
    "term": "xarope de groselha"
  },
  {
    "department": "bebidas",
    "term": "refresco em pó"
  },
  {
    "department": "bebidas",
    "term": "café pronto"
  },
  {
    "department": "bebidas",
    "term": "bebida vegetal de aveia"
  },
  {
    "department": "bebidas",
    "term": "bebida de soja"
  },
  {
    "department": "bebidas",
    "term": "limonada"
  },
  {
    "department": "congelados",
    "term": "batata frita congelada"
  },
  {
    "department": "congelados",
    "term": "polpa de acerola"
  },
  {
    "department": "congelados",
    "term": "polpa de maracujá"
  },
  {
    "department": "congelados",
    "term": "polpa de morango"
  },
  {
    "department": "congelados",
    "term": "polpa de açaí"
  },
  {
    "department": "congelados",
    "term": "legumes congelados"
  },
  {
    "department": "congelados",
    "term": "brócolis congelado"
  },
  {
    "department": "congelados",
    "term": "ervilha congelada"
  },
  {
    "department": "congelados",
    "term": "milho congelado"
  },
  {
    "department": "congelados",
    "term": "lasanha congelada"
  },
  {
    "department": "congelados",
    "term": "pizza congelada"
  },
  {
    "department": "congelados",
    "term": "hambúrguer congelado"
  },
  {
    "department": "congelados",
    "term": "nuggets congelado"
  },
  {
    "department": "congelados",
    "term": "pão de queijo congelado"
  },
  {
    "department": "congelados",
    "term": "sorvete de creme"
  },
  {
    "department": "congelados",
    "term": "sorvete de chocolate"
  },
  {
    "department": "congelados",
    "term": "açaí congelado"
  },
  {
    "department": "congelados",
    "term": "picolé"
  },
  {
    "department": "congelados",
    "term": "massa folhada congelada"
  },
  {
    "department": "congelados",
    "term": "peixe empanado congelado"
  },
  {
    "department": "limpeza",
    "term": "detergente neutro"
  },
  {
    "department": "limpeza",
    "term": "detergente de limão"
  },
  {
    "department": "limpeza",
    "term": "sabão em pó"
  },
  {
    "department": "limpeza",
    "term": "sabão líquido roupas"
  },
  {
    "department": "limpeza",
    "term": "amaciante"
  },
  {
    "department": "limpeza",
    "term": "água sanitária"
  },
  {
    "department": "limpeza",
    "term": "desinfetante"
  },
  {
    "department": "limpeza",
    "term": "limpador multiuso"
  },
  {
    "department": "limpeza",
    "term": "limpa vidro"
  },
  {
    "department": "limpeza",
    "term": "saponáceo"
  },
  {
    "department": "limpeza",
    "term": "esponja de cozinha"
  },
  {
    "department": "limpeza",
    "term": "palha de aço"
  },
  {
    "department": "limpeza",
    "term": "sabão em barra"
  },
  {
    "department": "limpeza",
    "term": "álcool 70"
  },
  {
    "department": "limpeza",
    "term": "lustra móveis"
  },
  {
    "department": "limpeza",
    "term": "desengordurante"
  },
  {
    "department": "limpeza",
    "term": "limpa banheiro"
  },
  {
    "department": "limpeza",
    "term": "amaciante concentrado"
  },
  {
    "department": "limpeza",
    "term": "inseticida doméstico"
  },
  {
    "department": "limpeza",
    "term": "odorizador de ambiente"
  },
  {
    "department": "limpeza",
    "term": "papel toalha"
  },
  {
    "department": "limpeza",
    "term": "papel higiênico"
  },
  {
    "department": "limpeza",
    "term": "guardanapo"
  },
  {
    "department": "limpeza",
    "term": "saco de lixo"
  },
  {
    "department": "limpeza",
    "term": "filme plástico"
  },
  {
    "department": "limpeza",
    "term": "papel alumínio"
  },
  {
    "department": "higiene",
    "term": "sabonete em barra"
  },
  {
    "department": "higiene",
    "term": "sabonete líquido"
  },
  {
    "department": "higiene",
    "term": "shampoo"
  },
  {
    "department": "higiene",
    "term": "condicionador"
  },
  {
    "department": "higiene",
    "term": "creme dental"
  },
  {
    "department": "higiene",
    "term": "escova dental"
  },
  {
    "department": "higiene",
    "term": "fio dental"
  },
  {
    "department": "higiene",
    "term": "enxaguante bucal"
  },
  {
    "department": "higiene",
    "term": "desodorante aerosol"
  },
  {
    "department": "higiene",
    "term": "desodorante roll on"
  },
  {
    "department": "higiene",
    "term": "absorvente"
  },
  {
    "department": "higiene",
    "term": "algodão"
  },
  {
    "department": "higiene",
    "term": "cotonete"
  },
  {
    "department": "higiene",
    "term": "papel facial"
  },
  {
    "department": "higiene",
    "term": "creme hidratante"
  },
  {
    "department": "higiene",
    "term": "protetor solar"
  },
  {
    "department": "higiene",
    "term": "aparelho de barbear"
  },
  {
    "department": "higiene",
    "term": "espuma de barbear"
  },
  {
    "department": "higiene",
    "term": "fralda infantil"
  },
  {
    "department": "higiene",
    "term": "lenço umedecido"
  },
  {
    "department": "higiene",
    "term": "fralda geriátrica"
  },
  {
    "department": "pet",
    "term": "ração para cães"
  },
  {
    "department": "pet",
    "term": "ração para gatos"
  },
  {
    "department": "pet",
    "term": "ração para filhotes"
  },
  {
    "department": "pet",
    "term": "ração úmida para cães"
  },
  {
    "department": "pet",
    "term": "ração úmida para gatos"
  },
  {
    "department": "pet",
    "term": "petisco para cães"
  },
  {
    "department": "pet",
    "term": "petisco para gatos"
  },
  {
    "department": "pet",
    "term": "areia sanitária para gatos"
  },
  {
    "department": "pet",
    "term": "tapete higiênico"
  },
  {
    "department": "pet",
    "term": "shampoo para cães"
  },
  {
    "department": "pet",
    "term": "coleira para cães"
  },
  {
    "department": "pet",
    "term": "sachê para gatos"
  },
  {
    "department": "pet",
    "term": "osso para cães"
  },
  {
    "department": "pet",
    "term": "biscoito para cães"
  },
  {
    "department": "utilidades",
    "term": "papel manteiga"
  },
  {
    "department": "utilidades",
    "term": "forma de alumínio"
  },
  {
    "department": "utilidades",
    "term": "marmita descartável"
  },
  {
    "department": "utilidades",
    "term": "copo descartável"
  },
  {
    "department": "utilidades",
    "term": "prato descartável"
  },
  {
    "department": "utilidades",
    "term": "talheres descartáveis"
  },
  {
    "department": "utilidades",
    "term": "pote plástico"
  },
  {
    "department": "utilidades",
    "term": "garrafa térmica"
  },
  {
    "department": "utilidades",
    "term": "squeeze"
  },
  {
    "department": "utilidades",
    "term": "esponja multiuso"
  },
  {
    "department": "utilidades",
    "term": "pano de limpeza"
  },
  {
    "department": "utilidades",
    "term": "luva doméstica"
  },
  {
    "department": "utilidades",
    "term": "vela"
  },
  {
    "department": "utilidades",
    "term": "pilha alcalina"
  },
  {
    "department": "utilidades",
    "term": "lâmpada led"
  },
  {
    "department": "utilidades",
    "term": "filtro de papel café"
  },
  {
    "department": "utilidades",
    "term": "coador de café"
  },
  {
    "department": "utilidades",
    "term": "saco zip"
  },
  {
    "department": "utilidades",
    "term": "pote hermético"
  },
  {
    "department": "utilidades",
    "term": "organizador plástico"
  },
  {
    "department": "hortifruti",
    "term": "banana prata"
  },
  {
    "department": "hortifruti",
    "term": "maçã gala"
  },
  {
    "department": "hortifruti",
    "term": "laranja pera"
  },
  {
    "department": "hortifruti",
    "term": "mamão papaya"
  },
  {
    "department": "hortifruti",
    "term": "melancia"
  },
  {
    "department": "hortifruti",
    "term": "melão"
  },
  {
    "department": "hortifruti",
    "term": "abacaxi"
  },
  {
    "department": "hortifruti",
    "term": "manga palmer"
  },
  {
    "department": "hortifruti",
    "term": "uva sem semente"
  },
  {
    "department": "hortifruti",
    "term": "morango"
  },
  {
    "department": "hortifruti",
    "term": "limão tahiti"
  },
  {
    "department": "hortifruti",
    "term": "abacate"
  },
  {
    "department": "hortifruti",
    "term": "tomate italiano"
  },
  {
    "department": "hortifruti",
    "term": "batata inglesa"
  },
  {
    "department": "hortifruti",
    "term": "cebola"
  },
  {
    "department": "hortifruti",
    "term": "alho"
  },
  {
    "department": "hortifruti",
    "term": "cenoura"
  },
  {
    "department": "hortifruti",
    "term": "beterraba"
  },
  {
    "department": "hortifruti",
    "term": "chuchu"
  },
  {
    "department": "hortifruti",
    "term": "abobrinha"
  },
  {
    "department": "hortifruti",
    "term": "pepino"
  },
  {
    "department": "hortifruti",
    "term": "pimentão verde"
  },
  {
    "department": "hortifruti",
    "term": "brócolis"
  },
  {
    "department": "hortifruti",
    "term": "couve flor"
  },
  {
    "department": "hortifruti",
    "term": "alface crespa"
  },
  {
    "department": "hortifruti",
    "term": "couve manteiga"
  },
  {
    "department": "hortifruti",
    "term": "rúcula"
  },
  {
    "department": "hortifruti",
    "term": "agrião"
  },
  {
    "department": "hortifruti",
    "term": "cheiro verde"
  },
  {
    "department": "hortifruti",
    "term": "coentro"
  },
  {
    "department": "hortifruti",
    "term": "salsinha"
  },
  {
    "department": "hortifruti",
    "term": "cebolinha"
  },
  {
    "department": "hortifruti",
    "term": "mandioca"
  },
  {
    "department": "hortifruti",
    "term": "inhame"
  },
  {
    "department": "hortifruti",
    "term": "batata doce"
  },
  {
    "department": "hortifruti",
    "term": "gengibre"
  },
  {
    "department": "hortifruti",
    "term": "repolho"
  },
  {
    "department": "hortifruti",
    "term": "berinjela"
  },
  {
    "department": "hortifruti",
    "term": "quiabo"
  },
  {
    "department": "hortifruti",
    "term": "vagem"
  },
  {
    "department": "hortifruti",
    "term": "maçã fuji"
  },
  {
    "department": "hortifruti",
    "term": "pera"
  },
  {
    "department": "hortifruti",
    "term": "kiwi"
  },
  {
    "department": "hortifruti",
    "term": "maracujá"
  },
  {
    "department": "hortifruti",
    "term": "goiaba"
  },
  {
    "department": "hortifruti",
    "term": "caqui"
  },
  {
    "department": "hortifruti",
    "term": "coco verde"
  },
  {
    "department": "hortifruti",
    "term": "tangerina"
  },
  {
    "department": "hortifruti",
    "term": "ameixa"
  }
]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function findProduct(entry) {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
  url.searchParams.set('search_terms', entry.term)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', '8')
  url.searchParams.set('fields', 'code,product_name,brands,quantity,image_front_url,image_url,categories,countries_tags')

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (response.status === 429 || response.status >= 500) {
        await sleep(1200 * (attempt + 1))
        continue
      }
      if (!response.ok) return null
      const data = await response.json()
      const products = (data.products ?? []).filter(product =>
        product.code && product.product_name && (product.image_front_url || product.image_url)
      )
      const best = products.find(product => (product.countries_tags ?? []).some(country => country.includes('brazil'))) ?? products[0]
      if (!best) return null
      return {
        id: String(best.code),
        barcode: String(best.code),
        searchTerm: entry.term,
        department: entry.department,
        name: best.product_name,
        brand: best.brands || null,
        quantity: best.quantity || null,
        imageUrl: best.image_front_url || best.image_url,
        source: 'Open Food Facts',
        sourceUrl: `https://world.openfoodfacts.org/product/${best.code}`,
        imageLicense: 'CC BY-SA 3.0 (confirm current asset terms and attribution before commercial publication)',
        databaseLicense: 'ODbL',
        countryMatch: (best.countries_tags ?? []).some(country => country.includes('brazil')),
        verifiedForSale: false,
        importedAt: new Date().toISOString(),
      }
    } catch (error) {
      if (attempt === 2) console.warn(`Falha em "${entry.term}": ${error.message}`)
      await sleep(800 * (attempt + 1))
    }
  }
  return null
}

const selected = queries.slice(0, Math.min(LIMIT, queries.length))
const results = []
const seen = new Set()
let cursor = 0
async function worker() {
  while (cursor < selected.length) {
    const entry = selected[cursor++]
    const item = await findProduct(entry)
    if (item && !seen.has(item.barcode)) {
      seen.add(item.barcode)
      results.push(item)
    }
    await sleep(350)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
results.sort((a, b) => a.department.localeCompare(b.department) || a.searchTerm.localeCompare(b.searchTerm))
await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: 'Open Food Facts',
  requestedQueries: selected.length,
  importedWithImages: results.length,
  note: 'Research catalog only. Images and product identity require human review; no commercial-use approval is implied.',
  products: results,
}, null, 2) + '\\n')
console.log(`Consultas: ${selected.length}; produtos únicos com imagem: ${results.length}`)
console.log(`Arquivo: ${OUTPUT}`)
console.log('Revise licença, atribuição, correspondência da embalagem e autorização comercial antes de publicar.')
