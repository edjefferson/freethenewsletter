class NewsletterController < ApplicationController

  def encode str
    encoded = str.force_encoding('UTF-8')
    unless encoded.valid_encoding?
      encoded = str.encode("utf-8", invalid: :replace, undef: :replace, replace: '?')
    end
    encoded
  end

  def return_unread
    #check_email
    emails = Email.where(read: 0).order(date: :desc)
    respond_to do |format| 
      format.json { render :json => emails } 
    end 
  end

  def check_email
    imap = Net::IMAP.new(ENV["MAIL_SERVER"], ssl: true)
    imap.port          => 993
    imap.tls_verified? => true
    imap.login(ENV["MAIL_USER"], ENV["MAIL_PASS"])
    imap.select("INBOX")
    uids = imap.uid_search(["ALL"])
    emails = uids.each do |uid|
      email_record = Email.where(uid: uid).first_or_create
      raw_email = imap.uid_fetch(uid, "RFC822").first.attr["RFC822"]
      mail = Mail.read_from_string raw_email
      puts mail.inspect
      email_record.update({
        title: mail.subject,
        sender: mail.from,
        date: mail.date,
        htmlbody: Nokogiri::HTML(encode mail.html_part.body.to_s).css("body").inner_html,
        read: 0
      })
    end
    
    
  end
end
