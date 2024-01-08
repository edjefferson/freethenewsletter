class NewsletterController < ApplicationController

  def encode str
    encoded = str.force_encoding('UTF-8')
    unless encoded.valid_encoding?
      encoded = str.encode("utf-8", invalid: :replace, undef: :replace, replace: '?')
    end
    encoded
  end

  def return_unread
    check_email
    user_id = User.find_by(api_key: params[:key]).id
    emails = Email.where(read: 0, user_id: user_id).order(date: :desc)
    respond_to do |format| 
      format.json { render :json => emails } 
    end 
  end

  def check_email
    #puts params.inspect
    user = User.find_by(api_key: params['key'])
    imap = Net::IMAP.new(user.mail_server, ssl: true)
    imap.port          => 993
    imap.tls_verified? => true
    imap.login(user.mail_user, user.mail_pass)
    imap.select("INBOX")
    uids = imap.uid_search(["ALL"])
    emails = uids.each do |uid|
      email_record = Email.where(uid: uid, user_id: user.id).first_or_create
      raw_email = imap.uid_fetch(uid, "RFC822").first.attr["RFC822"]
      mail = Mail.read_from_string raw_email
      email_record.update({
        title: mail.subject,
        sender: mail.from,
        date: mail.date,
        htmlbody: Nokogiri::HTML(encode mail.html_part.body.to_s).css("body").inner_html,
        read: 0
      })
    end
    
    
  end

  def mark_read
    puts params
    user = User.find_by(api_key: params['key'])
    email = Email.where(user_id: user.id, uid: params['emailId'])[0]
    email.read = 1
    email.save
    render :json => {"email": email}
  end
end