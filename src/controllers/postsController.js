import { getTodosPosts, criarPost, atualizarPost } from "../models/postsModels.js"; 
// Importa as funções para obter todos os posts e criar um novo post do módulo 'postsModels'.

import fs from "fs";
// Importa o módulo 'fs' do Node.js para realizar operações com o sistema de arquivos.

import gerarDescricaoComGemini from "../services/geminiService.js"

export async function listarPosts (req, res)
{
    const posts = await getTodosPosts();
    // Chama a função 'getTodosPosts' para buscar todos os posts do banco de dados e armazena o resultado na variável 'posts'.

    res.status(200).json(posts);
    // Envia uma resposta HTTP com status 200 (sucesso) e os dados dos posts no formato JSON.
} 

export async function postarNovoPost(req, res) {
    const novoPost = req.body;
    // Obtém os dados do novo post enviados no corpo da requisição.

    try {
        const postCriado = await criarPost(novoPost); 
        // Chama a função 'criarPost' para inserir o novo post no banco de dados e armazena o resultado na variável 'postCriado'.

        res.status(200).json(postCriado);
        // Envia uma resposta HTTP com status 200 (sucesso) e os dados do post criado.
    } catch(erro) {
        console.error(erro.message);
        // Imprime a mensagem de erro no console para facilitar a depuração.

        res.status(500).json({"Erro":"Falha na requisição"})
        // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro genérica.
    }  
} 

export async function uploadImagem(req, res) {
    const novoPost = {
        descricao: "",
        imgUrl: req.file.originalname,
        alt: ""
    };
    // Cria um objeto para representar o novo post, incluindo o nome original do arquivo da imagem.

    try {
        const postCriado = await criarPost(novoPost);
        // Chama a função 'criarPost' para inserir o novo post no banco de dados e armazena o resultado na variável 'postCriado'.

        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`
        // Constrói o novo nome do arquivo da imagem, utilizando o ID do post criado.

        fs.renameSync(req.file.path, imagemAtualizada)
        // Renomeia o arquivo da imagem para o novo nome, movendo-o para a pasta 'uploads'.

        res.status(200).json(postCriado); 
        // Envia uma resposta HTTP com status 200 (sucesso) e os dados do post criado.
    } catch(erro) {
        console.error(erro.message);
        // Imprime a mensagem de erro no console para facilitar a depuração.

        res.status(500).json({"Erro":"Falha na requisição"})
        // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro genérica.
    }
}

export async function atualizarNovoPost(req, res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/${id}.png`
    
    // Obtém os dados do novo post enviados no corpo da requisição.

    try { 
        const imgBuffer = fs.readFileSync(`uploads/${id}.png`)
        const descricao = await gerarDescricaoComGemini(imgBuffer)
        
        const post = {
            imgUrl: urlImagem, 
            descricao: descricao, 
            alt: req.body.alt
        }

        const postCriado = await atualizarPost(id, post); 
         
        res.status(200).json(postCriado);
        // Envia uma resposta HTTP com status 200 (sucesso) e os dados do post criado.
    } catch(erro) {
        console.error(erro.message);
        // Imprime a mensagem de erro no console para facilitar a depuração.

        res.status(500).json({"Erro":"Falha na requisição"})
        // Envia uma resposta HTTP com status 500 (erro interno do servidor) e uma mensagem de erro genérica.
    } 
} 
