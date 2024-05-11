import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button} from '@mui/material';
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "./App.css";

/**
 * Componente principal do aplicativo.
 * 
 * @returns {JSX.Element} O componente React renderizado.
 */
function App() {
  // Estado para armazenar a pergunta do usuário.
  const [question, setQuestion] = useState("");
  
  // Estado para armazenar a resposta da API.
  const [answer, setAnswer] = useState("");
  
  // Estado para indicar se a resposta está sendo gerada.
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  // Estado para armazenar as mensagens no chat.
  const [messages, setMessages] = useState([]);
  
  // Referência para o final da lista de mensagens.
  const messagesEndRef = useRef(null);

  // URL da API do Google Cloud.
  const apiUrl = process.env.REACT_APP_API_URL;

  /**
   * Gera a resposta da API para a pergunta do usuário.
   * 
   * @param {Event} e - O evento de clique do botão.
   */
  async function generateAnswer(e) {
    // Impede o comportamento padrão do formulário.
    e.preventDefault();

    // Define o estado para indicar que a resposta está sendo gerada.
    setGeneratingAnswer(true);

    // Define uma mensagem provisória enquanto a resposta é carregada.
    setAnswer("Carregando a sua respostas... \n pode levar 10 segundos, aguarde...");

    try {
      // Faz a requisição para a API do Google Cloud.
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiUrl}`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: 'Prepare um receita deliciosa com os ingredinetes' + question }] }],
        },
      });

      // Adiciona a pergunta e a resposta à lista de mensagens.
      handleSend(question)
      handleSend(response["data"]["candidates"][0]["content"]["parts"][0]["text"])

      // Limpa a pergunta e a resposta.
      setQuestion('');
      setAnswer("");

    } catch (error) {
      // Exibe uma mensagem de erro no console.
      console.log(error);

      // Define uma mensagem de erro na resposta.
      setAnswer("Alguma deu errado. Por favor, tente novamente!");
    }

    // Define o estado para indicar que a resposta terminou de ser gerada.
    setGeneratingAnswer(false);
  }

  /**
   * Limpa as mensagens do chat.
   * 
   * @param {Event} e - O evento de clique do botão.
   */
  async function clear(e) {
    // Define o estado para indicar que a resposta não está sendo gerada.
    setGeneratingAnswer(false);
	
	// Limpa as mensagens do chat.
	setMessages([]);
  }

  /**
   * Adiciona uma nova mensagem à lista de mensagens.
   * 
   * @param {string} mensagem - A mensagem a ser adicionada.
   */
  const handleSend = (mensagem) => {
    // Adiciona a mensagem à lista de mensagens.
    setMessages(messages => [...messages, mensagem]);
  }
  
  // Efeito colateral para rolar para a última mensagem do chat.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);
  
  // Retorna o componente React renderizado.
  return (
    <form>
      <div className="main">
        <div align="center" className="header">
          <div className="box;width: 25%"><img src="logo.png" width="200px" alt="logo"/></div>
          <div className="box;width: 75%">
            <h1 align="center">Master Chef Chat</h1>
            <h3 align="center">Informe os ingredientes que você tem e te darei uma receita maravilhosa.</h3>
          </div>
        </div>
        <div className="container">
          <div className="markdown-container">
            {messages.map((msg, index) => (
              <ReactMarkdown key={index}>
                {(index % 2 === 0) ? 'Aqui está sua receita com os ingredientes:' + msg: msg}
              </ReactMarkdown>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div>
          <TextField
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite aqui os ingredientes que você tem..."
            fullWidth
          />
          <p align="center">
            <Button onClick={generateAnswer} variant="contained" color="primary">
              Enviar
            </Button>&nbsp;&nbsp;
            <Button onClick={clear} variant="contained" color="primary">
              Limpar
            </Button>		
          </p>
        </div>
        <div>{answer}</div>
      </div>
    </form>
  );
}

export default App;